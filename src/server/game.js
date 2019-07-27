const Constants = require('../shared/constants');
const Player = require('./player');
const Bullet = require('./bullet');
const Zombie = require('./zombie');
const Thing = require('./thing');
const Collisions = require('./collisions');

const {
  applyCollisionsPlayers,
  applyCollisionsZombies,
  applyCollisionsPlayersAndZombies,
  applyCollisionsPlayersAndThings
} = Collisions

const createXpList = () => {
  const list = [0]
  for (let i = 1; i < 10; i++) {
    list.push(i * i * 500)
  }
  list.push(1000000)
  return list
}

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
    setInterval(this.update.bind(this), 1000 / 24)
    this.createZombies()
    setInterval(this.respawnZombies.bind(this), 60000)
    this.options = {
      xp_levels: createXpList(),
      things: ['hp', 'speed', 'accuracy', 'portal', 'defense', 'damage']
    }
    this.createThings()
  }

  createZombie (x, y, type) {
    const zombie = new Zombie(x, y, type)
    this.zombies.push(zombie)
  }

  createZombies() {
    for (let i = 0; i < Constants.ZOMBIE_EASY_MAX_AMOUNT; i++) {
      const [x, y] = this.respawnCoords(1, 0.75, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'easy')
    }
    for (let i = 0; i < Constants.ZOMBIE_NORMAL_MAX_AMOUNT; i++) {
      const [x, y] = this.respawnCoords(0.75, 0.5, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'normal')
    }
    for (let i = 0; i < Constants.ZOMBIE_HARD_MAX_AMOUNT; i++) {
      const [x, y] = this.respawnCoords(0.5, 0.25, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'hard')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_EASY_MAX_AMOUNT; i++) {
      const [x, y] = this.respawnCoords(1, 0.75, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_easy')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_NORMAL_MAX_AMOUNT; i++) {
      const [x, y] = this.respawnCoords(0.75, 0.5, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_normal')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_HARD_MAX_AMOUNT; i++) {
      const [x, y] = this.respawnCoords(0.5, 0.25, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_hard')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_LEGEND_MAX_AMOUNT; i++) {
      const [x, y] = this.respawnCoords(0.25, 0, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_legend')
    }
  }

  respawnZombies() {
    const zombieTypes = this.zombies.reduce((total, zombie) => {
      const {name} = zombie.type
      if (total[name]) {
        total[name] += 1
        return total
      }
      total[name] = 1
      return total
    }, {})

    for (let i = 0; i < Constants.ZOMBIE_EASY_MAX_AMOUNT - zombieTypes['easy']; i++) {
      const [x, y] = this.respawnCoords(1, 0.75, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'easy')
    }
    for (let i = 0; i < Constants.ZOMBIE_NORMAL_MAX_AMOUNT - zombieTypes['normal']; i++) {
      const [x, y] = this.respawnCoords(0.75, 0.5, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'normal')
    }
    for (let i = 0; i < Constants.ZOMBIE_HARD_MAX_AMOUNT - zombieTypes['hard']; i++) {
      const [x, y] = this.respawnCoords(0.5, 0.25, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'hard')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_EASY_MAX_AMOUNT - zombieTypes['boss_easy']; i++) {
      const [x, y] = this.respawnCoords(1, 0.75, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_easy')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_NORMAL_MAX_AMOUNT - zombieTypes['boss_normal']; i++) {
      const [x, y] = this.respawnCoords(0.75, 0.5, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_normal')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_HARD_MAX_AMOUNT - zombieTypes['boss_hard']; i++) {
      const [x, y] = this.respawnCoords(0.5, 0.25, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_hard')
    }
    for (let i = 0; i < Constants.ZOMBIE_BOSS_LEGEND_MAX_AMOUNT - zombieTypes['boss_legend']; i++) {
      const [x, y] = this.respawnCoords(0.25, 0, this.checkPlayersInRadius.bind(this))
      this.createZombie(x, y, 'boss_legend')
    }
  }

  checkZombiesInRadius(x, y) {
    const findZombieInZone = this.zombies.find(zombie => zombie.distanceTo({x, y}) < 250)
    return findZombieInZone
  }

  checkPlayersInRadius(x, y) {
    const findPlayerInZone = Object.values(this.players).find(player => player.distanceTo({x, y}) < 250)
    return findPlayerInZone
  }

  respawnCoords (boundsA, boundsB, checkFn) {
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

    if (checkFn && checkFn(x, y)) {
      return this.respawnCoords(boundsA, boundsB, checkFn.bind(this))
    } else {
      return [x, y]
    }
  }

  createThings () {
    for (let i = 0; i < Constants.THING_AMOUNT; i++) {
      const rand = Math.floor(Math.random() * this.options.things.length)
      const name = this.options.things[rand]
      const [x, y] = [Math.random() * Constants.MAP_SIZE, Math.random() * Constants.MAP_SIZE]
      const thing = new Thing(x, y, {name, icon: `thing_${name}.svg`})
      this.things.push(thing)
    }
  }

  addPlayer(socket, options) {
    this.sockets[socket.id] = socket;

    const [x, y] = this.respawnCoords(1, 0.75, this.checkZombiesInRadius.bind(this))
    const {username, icon} = options
    
    this.players[socket.id] = new Player(socket.id, username, x, y, icon);
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

  updateWeapon(socket, weapon) {
    if (this.players[socket.id]) {
      this.players[socket.id].updateWeapon(weapon)
    }
  }

  addNewSkill(socket, skill) {
    if (this.players[socket.id]) {
      this.players[socket.id].addNewSkill(skill)
    }
  }

  useActiveSkill(socket, skill) {
    if (this.players[socket.id]) {
      this.players[socket.id].useActiveSkill(skill)
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
        } else if (zombie.checkLocationInZone() === false && zombie.mode !== 'returning' && zombie.changingDirection) {
          zombie.setMode('returning')
          let x, y
          if (['easy', 'boss_easy'].includes(zombie.type.name)) {
            [x, y] = this.respawnCoords(1, 0.75, false)
          } else if (['normal', 'boss_normal'].includes(zombie.type.name)) {
            [x, y] = this.respawnCoords(0.75, 0.5, false)
          } else if (['hard', 'boss_hard'].includes(zombie.type.name)) {
            [x, y] = this.respawnCoords(0.5, 0.25, false)
          } else if (['boss_legend'].includes(zombie.type.name)) {
            [x, y] = this.respawnCoords(0.25, 0, false)
          }
          const dir = Math.atan2(x - zombie.x, zombie.y - y)
          zombie.setDirection(dir)
          zombie.changeRotate(dir)
          zombie.resetChangingDirection()
        } else if (zombie.checkLocationInZone() === true) {
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

        if (['boss_easy'].includes(zombie.type.name) && zombie.mode === 'active') {

        } else if (['boss_normal'].includes(zombie.type.name) && zombie.mode === 'active') {
          if (zombie.abilities.use_teleport) {
            const distance = zombie.distanceTo(player)
            zombie.x += Math.sin(zombie.rotate) * (distance + 100)
            zombie.y -= Math.cos(zombie.rotate) * (distance + 100)
            zombie.abilities.use_teleport = false
          }
        } else if (['boss_hard'].includes(zombie.type.name) && zombie.mode === 'active') {
          if (zombie.abilities.use_create_vampire_bullets) {
            const amount_bullets = 24
            for (let i = 0; i < amount_bullets; i++) {
              const bullet_options = {
                parentID: zombie.id,
                x: zombie.x + Math.sin(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
                y: zombie.y - Math.cos(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
                rotate: zombie.rotate + (Math.PI / (amount_bullets / 2) * i),
                radius: 10,
                speed: 300,
                damage: 20,
                distance: 1500,
                effect: 'vampire'
              }
              this.bullets.push(new Bullet(bullet_options))
            }
            zombie.resetActiveSkill('use_create_vampire_bullets')
          }
        } else if (['boss_legend'].includes(zombie.type.name) && zombie.mode === 'active') {
          if (zombie.abilities.use_create_fire_bullets) {
            const amount_bullets = 36
            for (let i = 0; i < amount_bullets; i++) {
              const bullet_options = {
                parentID: zombie.id,
                x: zombie.x + Math.sin(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
                y: zombie.y - Math.cos(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
                rotate: zombie.rotate + (Math.PI / (amount_bullets / 2) * i),
                radius: 10,
                speed: 300,
                damage: 20,
                distance: 1500,
                effect: 'fire'
              }
              this.bullets.push(new Bullet(bullet_options))
              setTimeout(() => {
                this.bullets.push(new Bullet({
                  ...bullet_options,
                  x: zombie.x + Math.sin(zombie.rotate + (Math.PI / (amount_bullets / 2) * i) + (Math.PI / 6)) * (zombie.radius + 25),
                  y: zombie.y - Math.cos(zombie.rotate + (Math.PI / (amount_bullets / 2) * i) + (Math.PI / 6)) * (zombie.radius + 25),
                }))
              }, 300)
            }
            zombie.resetActiveSkill('use_create_fire_bullets')
          }
        }
      })

      zombie.update(dt)
    })

    // Apply collisions, give players score for hitting bullets
    const destroyedBulletsPlayers = applyCollisionsPlayers(Object.values(this.players), this.bullets, this.zombies);
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
      this.players[id].takeBiteDamage(damage)
    })

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER, player.statistic);
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
          const thing = new Thing(x, y, {name: 'hp', icon: `thing_hp.svg`})
          this.things.push(thing)
        }
        destroyedZombies.push(zombie)
      }
    })
    this.zombies = this.zombies.filter(zombie => !destroyedZombies.includes(zombie))

    // Check collisions between zombies
    this.zombies.forEach(zombieA => {
      this.zombies.forEach(zombieB => {
        if (zombieA.distanceTo(zombieB) < zombieA.radius + zombieB.radius && zombieA.distanceTo(zombieB) !== 0) {
          const dir = Math.atan2(zombieA.x - zombieB.x, zombieB.y - zombieA.y)
          zombieA.setDirection(dir)
          zombieB.setDirection(-dir)
          if (['passive', 'returning'].includes(zombieA.mode) || ['passive', 'returning'].includes(zombieB.mode) ) {
            zombieA.changeRotate(dir)
            zombieB.changeRotate(-dir)
            zombieA.setMode('passive')
            zombieB.setMode('passive')
          }
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
