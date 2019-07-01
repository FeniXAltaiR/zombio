const Constants = require('../shared/constants');
const Player = require('./player');
const Zombie = require('./zombie');
const Thing = require('./thing');
const Collisions = require('./collisions');

const {
  applyCollisionsPlayers,
  applyCollisionsZombies,
  applyCollisionsPlayersAndZombies,
  applyCollisionsPlayersAndThings
} = Collisions

class Game {
  constructor(id) {
    this.id = id
    this.sockets = {}
    this.players = {}
    this.bullets = []
    this.zombies = []
    this.things = []
    this.lastUpdateTime = Date.now()
    this.shouldSendUpdate = false
    setInterval(this.update.bind(this), 1000 / 60)
    this.createZombies()
    this.createThings()
    // setInterval(this.respawnZombies.bind(this), 1000)
    this.options = {
      xp_levels: [0, 1000, 2500, 5000, 7500, 1000000]
    }
  }

  createZombie (x, y, type) {
    // const [x, y] = [Math.random() * Constants.MAP_SIZE, Math.random() * Constants.MAP_SIZE]
    const zombie = new Zombie(x, y, type)
    this.zombies.push(zombie)
  }

  createZombies() {
    for (let i = 0; i < Constants.ZOMBIE_EASY_MAX_AMOUNT / 4; i++) {
      const [x, y] = this.respawnCoords(1, 0.75)
      this.createZombie(x, y, 'easy')
    }
    for (let i = 0; i < Constants.ZOMBIE_NORMAL_MAX_AMOUNT / 4; i++) {
      const [x, y] = this.respawnCoords(0.75, 0.5)
      this.createZombie(x, y, 'normal')
    }
    for (let i = 0; i < Constants.ZOMBIE_HARD_MAX_AMOUNT / 4; i++) {
      const [x, y] = this.respawnCoords(0.5, 0.25)
      this.createZombie(x, y, 'hard')
    }
  }

  respawnZombies() {
    const amountZombiesEasy = this.zombies.filter(zombie => zombie.type.name === 'easy')
    for (let i = 1; i < (Constants.ZOMBIE_EASY_MAX_AMOUNT / amountZombiesEasy.length) ** 2; i++) {
      const [x, y] = this.respawnCoords(1, 0.75)
      this.createZombie(x, y, 'easy')
    }

    const amountZombiesNormal = this.zombies.filter(zombie => zombie.type.name === 'normal')
    for (let i = 1; i < (Constants.ZOMBIE_NORMAL_MAX_AMOUNT / amountZombiesNormal.length) ** 2; i++) {
      const [x, y] = this.respawnCoords(0.75, 0.5)
      this.createZombie(x, y, 'normal')
    }

    const amountZombiesHard = this.zombies.filter(zombie => zombie.type.name === 'hard')
    for (let i = 1; i < (Constants.ZOMBIE_HARD_MAX_AMOUNT / amountZombiesHard.length) ** 2; i++) {
      const [x, y] = this.respawnCoords(0.5, 0.25)
      this.createZombie(x, y, 'hard')
    }
  }

  respawnCoords (boundsA, boundsB) {
    const rand = Math.random()
    let x
    let y

    if (rand < 0.5) {
      x = Constants.MAP_SIZE * (Math.random() * boundsA)
      y = Constants.MAP_SIZE * (boundsB + Math.random() * 0.25)
    } else {
      x = Constants.MAP_SIZE * (boundsB + Math.random() * 0.25)
      y = Constants.MAP_SIZE * (Math.random() * boundsA)
    }

    return [x, y]
  }

  createThings () {
    for (let i = 0; i < Constants.THING_AMOUNT; i++) {
      const [x, y] = [Math.random() * Constants.MAP_SIZE, Math.random() * Constants.MAP_SIZE]
      const thing = new Thing(x, y, {hp: 100})
      this.things.push(thing)
    }
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    const [x, y] = this.respawnCoords(1, 0.75)
    
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

  levelUp(socket, code) {
    if (this.players[socket.id]) {
      this.players[socket.id].levelUp(code)
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
      const player = this.players[playerID]
      const newBullets = player.update(dt)
      if (newBullets) {
        newBullets.forEach(newBullet => {
          this.bullets.push(newBullet)
        })
      }
    });

    // Update each zombie
    this.zombies.forEach(zombie => {
      Object.keys(this.sockets).forEach(socket => {
        const player = this.players[socket]
        if (zombie.distanceTo(player) < zombie.agressiveDistance) {
          zombie.setMode('active')
        } else {
          zombie.setMode('passive')
        }

        if (zombie.mode === 'active') {
          const dir = Math.atan2(player.x - zombie.x, zombie.y - player.y)
          zombie.setDirection(dir)
          zombie.changeRotate(dir)
        }

        if (zombie.mode === 'passive' && zombie.changingDirection) {
          const dir = Math.atan2(Math.random() * 2 - 1, Math.random() * 2 - 1)
          zombie.setDirection(dir)
          zombie.changeRotate(dir)
          zombie.resetChangingDirection()
        }
      })
      zombie.update(dt)
    })

    // Apply collisions, give players score for hitting bullets
    const destroyedBulletsPlayers = applyCollisionsPlayers(Object.values(this.players), this.bullets);
    destroyedBulletsPlayers.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage();
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBulletsPlayers.includes(bullet));

    // Apply collisions zombies
    const destroyedBulletsZombies = applyCollisionsZombies(this.zombies, this.bullets, this.players)
    destroyedBulletsZombies.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage()
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBulletsZombies.includes(bullet))

    const playersDamagedByZombies = applyCollisionsPlayersAndZombies(Object.values(this.players), this.zombies)
    playersDamagedByZombies.forEach(player => {
      const {id, damage} = player
      this.players[id].takeDamage(damage)
    })

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }

      player.updateLevel(this.options.xp_levels)
    });

    // Check if any zombies are destroyed
    const destroyedZombies = []
    this.zombies.forEach(zombie => {
      if (zombie.hp <= 0) {
        const rand = Math.random()
        if (rand > 0.95) {
          const {x, y} = zombie
          const thing = new Thing(x, y, {hp: 100})
          this.things.push(thing)
        }
        destroyedZombies.push(zombie)
      }
    })
    this.zombies = this.zombies.filter(zombie => !destroyedZombies.includes(zombie))

    // Check collisions between zombies
    this.zombies.forEach(zombieA => {
      this.zombies.forEach(zombieB => {
        if (zombieA.distanceTo(zombieB) < Constants.ZOMBIE_RADIUS * 2 && zombieA.distanceTo(zombieB) !== 0) {
          const dir = Math.atan2(zombieA.x - zombieB.x, zombieB.y - zombieA.y)
          zombieA.setDirection(dir)
          zombieB.setDirection(-dir)
          zombieA.update(dt)
          zombieB.update(dt)
        }
      })
    })

    // Apply collisions between players and things
    const takedThings = applyCollisionsPlayersAndThings(Object.values(this.players), this.things)
    this.things = this.things.filter(thing => !takedThings.includes(thing))

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
      .map(p => ({ username: p.username, score: Math.round(p.score), level: p.experience.level }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= 1500
    );
    const nearbyBullets = this.bullets.filter(
      b => b.distanceTo(player) <= 1500
    );
    const nearbyZombies = this.zombies.filter(
      z => z.distanceTo(player) <= 1500
    );
    const nearbyThings = this.things.filter(
      t => t.distanceTo(player) <= 1500
    );

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      zombies: nearbyZombies.map(z => z.serializeForUpdate()),
      things: nearbyThings.map(t => t.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
