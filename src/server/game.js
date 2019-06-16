const Constants = require('../shared/constants');
const Player = require('./player');
const Zombie = require('./zombie');
const Collisions = require('./collisions');

const {applyCollisionsPlayers, applyCollisionsZombies} = Collisions

class Game {
  constructor(id) {
    this.id = id
    this.sockets = {}
    this.players = {}
    this.bullets = []
    this.zombies = []
    this.lastUpdateTime = Date.now()
    this.shouldSendUpdate = false
    setInterval(this.update.bind(this), 1000 / 60)
    this.createZombies()
  }

  createZombies() {
    for (let i = 0; i < 100; i++) {
      const [x, y] = [i * Constants.ZOMBIE_RADIUS * 2, i * Constants.ZOMBIE_RADIUS * 2]
      const zombie = new Zombie(x, y)
      this.zombies.push(zombie)
    }
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
    const rand = Math.random()
    let x
    let y

    if (rand < 0.5) {
      x = Constants.MAP_SIZE * Math.random()
      y = Constants.MAP_SIZE * (0.75 + Math.random() * 0.25)
    } else {
      x = Constants.MAP_SIZE * (0.75 + Math.random() * 0.25)
      y = Constants.MAP_SIZE * Math.random()
    }
    
    this.players[socket.id] = new Player(socket.id, username, x, y);
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleInput(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
    }
  }

  changeRotate(socket, rotate) {
    if (this.players[socket.id]) {
      this.players[socket.id].changeRotate(rotate)
    }
  }

  createBullet(socket) {
    if (this.players[socket.id]) {
      this.players[socket.id].createBullet()
    }
  }

  getOnlinePlayers() {
    return Object.keys(this.players).length
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each bullet
    const bulletsToRemove = [];
    this.bullets.forEach(bullet => {
      if (bullet.update(dt)) {
        // Destroy this bullet
        bulletsToRemove.push(bullet);
      }
    });
    this.bullets = this.bullets.filter(bullet => !bulletsToRemove.includes(bullet));

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      const newBullet = player.update(dt);
      if (newBullet) {
        this.bullets.push(newBullet);
      }
    });

    // Apply collisions, give players score for hitting bullets
    const destroyedBulletsPlayers = applyCollisionsPlayers(Object.values(this.players), this.bullets);
    destroyedBulletsPlayers.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage();
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBulletsPlayers.includes(bullet));

    // Apply collisions zombies
    const destroyedBulletsZombies = applyCollisionsZombies(Object.values(this.zombies), this.bullets)
    destroyedBulletsZombies.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage()
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBulletsZombies.includes(bullet))

    this.zombies.forEach(zombie => {
      zombie.update(dt)
    })

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyBullets = this.bullets.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyZombies = this.zombies.filter(
      z => z.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      zombies: nearbyZombies.map(z => z.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
