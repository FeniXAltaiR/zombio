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
  for (let i = 1; i < 28; i++) {
    list.push(Math.round(i * i * 500 * Math.sqrt(i)))
  }
  list.push(10000000)
  return list
}

class Game {
  constructor(id) {
    this.id = id
    this.sockets = {}
    this.players = {}
    this.watchers = {}
    this.bullets = []
    this.zombies = []
    this.things = []
    this.lastUpdateTime = Date.now()
    this.shouldSendUpdate = false
    setInterval(this.update.bind(this), 1000 / 24)
    this.createZombies()
    setInterval(this.respawnZombies.bind(this), 60000)
    setInterval(this.respawnThings.bind(this), 60000)
    this.options = {
      xp_levels: createXpList(),
      things: ['hp', 'speed', 'accuracy', 'portal', 'defense', 'damage']
    }
    this.createThings()
    this.trash = {
      bullets_removed: [],
      zombies_removed: [],
      things_removed: []
    }
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

  createThing() {
    const rand = Math.floor(Math.random() * this.options.things.length)
    const name = this.options.things[rand]
    const [x, y] = [Math.random() * Constants.MAP_SIZE, Math.random() * Constants.MAP_SIZE]
    const thing = new Thing(x, y, {name, icon: `thing_${name}.svg`})
    this.things.push(thing)
  }

  createThings () {
    for (let i = 0; i < Constants.THING_AMOUNT; i++) {
      this.createThing()
    }
  }

  respawnThings() {
    const length = this.things.length
    for (let i = length; i < Constants.THING_AMOUNT; i++) {
      this.createThing()
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

  addPlayer(socket, options) {
    this.sockets[socket.id] = socket;

    const [x, y] = this.respawnCoords(1, 0.75, this.checkZombiesInRadius.bind(this))
    const {username, icon, score} = options
    
    this.players[socket.id] = new Player({
      id: socket.id,
      username,
      x,
      y,
      icon,
      score
    })
  }

  removePlayer(socket) {
    const player = this.players[socket.id]
    if (player) {
      this.watchers[socket.id] = {
        score: player.score
      }
    }
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  disconnectPlayer(socket) {
    const killed_player = this.watchers[socket.id]
    if (killed_player) {
      delete this.watchers[socket.id]
    }
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

  // Update methods

  collisionsBetweenZombies(dt) {
    this.zombies.forEach(zombieA => {
      this.zombies.forEach(zombieB => {
        const {x, y} = zombieB
        if (zombieA.distanceTo({x, y}) < zombieA.radius + zombieB.radius && zombieA.distanceTo({x, y}) !== 0) {
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
  }

  createBullets(id, dt) {
    const newBullets = this.players[id].update(dt)
    if (newBullets) {
      newBullets.forEach(newBullet => {
        this.bullets.push(newBullet)
      })
    }
  }

  useActiveSkillZombies(zombie, player) {
    if (['boss_easy'].includes(zombie.type.name) && zombie.mode === 'active') {

    } else if (['boss_normal'].includes(zombie.type.name) && zombie.mode === 'active') {
      if (zombie.abilities.use_teleport) {
        const distance = zombie.distanceTo({x: player.x, y: player.y})
        zombie.x += Math.sin(zombie.rotate) * (distance + 250)
        zombie.y -= Math.cos(zombie.rotate) * (distance + 250)
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
  }

  udpateZombies(player, dt) {
    let full_damage = 0

    this.zombies.forEach(zombie => {
      if (zombie.distanceTo({x: player.x, y: player.y}) < zombie.agressiveDistance) {
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

      this.useActiveSkillZombies(zombie, player)

      // Check if any zombie has destroyed
      if (zombie.hp <= 0) {
        const rand = Math.random()
        if (rand > 0.95) {
          const {x, y} = zombie
          const thing = new Thing(x, y, {name: 'hp', icon: `thing_hp.svg`})
          this.things.push(thing)
        }

        if (zombie.lastShot !== null && this.players[zombie.lastShot]) {
          const xp = zombie.type.xp
          const lastShot = zombie.lastShot
          this.players[lastShot].onKilledZombie(xp)
          zombie.udpateLastShot(null)
        }
        this.trash.zombies_removed.push(zombie.id)
      }

      // Players, which have damaged by zombies
      if (
        this.players[player.id].distanceTo({x: zombie.x, y: zombie.y}) <= Constants.PLAYER_RADIUS + zombie.radius / 2 &&
        zombie.bite
      ) {
        full_damage += zombie.damage
        zombie.cooldownBite()
      }

      zombie.update(dt)
    })

    if (full_damage > 0) {
      const {id} = player
      this.players[id].takeBiteDamage(full_damage)
    }
  }

  sendGameUpdate() {
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(id_socket => {
        const socket = this.sockets[id_socket]
        const {x, y, id} = this.players[id_socket]
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate({x, y, id}, leaderboard));
      })
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  checkPlayerIsAlive(socket, {hp, id}) {
    const player = this.players[id]
    player.updateLevel(this.options.xp_levels)

    if (hp <= 0) {
      const lastShot = player.lastShot
      if (lastShot !== null && this.players[lastShot]) {
        this.players[lastShot].udpateLastShot(null)
        this.players[lastShot].onKilledPlayer(player.score)
        this.players[lastShot].updateHp(75)
      }
      socket.emit(Constants.MSG_TYPES.GAME_OVER, this.players[id].statistic);
      socket.emit(Constants.MSG_TYPES.SAVE_ID_PLAYER, {
        id,
        score: this.players[id].score
      });
      this.removePlayer(socket);
    }
  }

  checkThingsToRemove(id) {
    this.things.forEach(thing => {
      const {x, y} = thing
      if (this.players[id].distanceTo({x, y}) <= Constants.PLAYER_RADIUS + Constants.THING_RADIUS) {
        this.players[id].takeBuff(thing.options.name)
        this.trash.things_removed.push(thing.id)
      }
    })
  }

  checkBulletShootPlayers({x, y, parentID, damage, radius, effect, id}) {
    Object.keys(this.sockets).forEach(socket => {
      const player = this.players[socket]
      if (
        parentID !== player.id &&
        player.distanceTo({x, y}) <= Constants.PLAYER_RADIUS + radius
      ) {
        if (damage < player.hp) {
          this.trash.bullets_removed.push(id)
        }
        player.takeBulletDamage({damage})
        player.udpateLastShot(parentID)
        if (this.players[parentID]) {
          this.players[parentID].onDealtDamage();
          if (player.hp <= 0) {
            this.players[parentID].udpateLastShot(null)
            this.players[parentID].onKilledPlayer(player.score)
            this.players[parentID].updateHp(75)
          }
        }
        if (effect === 'fire') {
          player.activeDebuff('fire')
        } else if (effect === 'vampire') {
          const findZombie = this.zombies.find(zomb => zomb.id === parentID)
          if (findZombie) {
            findZombie.updateHp(damage * 2)
          }
        }
      }
    })
  }

  checkBulletShootZombies({x, y, parentID, damage, radius, effect, id}) {
    this.zombies.forEach(zombie => {
      if (
        parentID !== zombie.id &&
        zombie.distanceTo({x, y}) <= zombie.radius + radius
      ) {
        if (damage < zombie.hp) {
          this.trash.bullets_removed.push(id)
        }
        zombie.takeBulletDamage({damage})
        zombie.udpateLastShot(parentID)
        if (this.players[parentID]) {
          this.players[parentID].onDealtDamage();
        }
        if (zombie.hp <= 0) {
          const xp = zombie.type.xp
          if (this.players[parentID]) {
            zombie.udpateLastShot(null)
            this.players[parentID].onKilledZombie(xp)
            if (['boss_easy', 'boss_normal', 'boss_hard', 'boss_legend'].includes(zombie.type.name)) {
              this.players[parentID].activeBossBonus(zombie.type.name)
            }
          }
          this.trash.zombies_removed.push(zombie.id)
        }
        if (effect === 'fire') {
          zombie.activeDebuff('fire')
        } else if (effect === 'vampire') {
          const findZombie = this.zombies.find(zomb => zomb.id === parentID)
          if (findZombie) {
            findZombie.updateHp(damage * 2)
          }
        }
      }
    })
  }

  updateBullet(bullet, dt) {
    if (bullet.update(dt)) {
      this.trash.bullets_removed.push(bullet.id);
    }
  }

  clearTrash() {
    this.bullets = this.bullets.filter(bullet => !this.trash.bullets_removed.includes(bullet.id))
    this.things = this.things.filter(thing => !this.trash.things_removed.includes(thing.id))
    this.zombies = this.zombies.filter(zombie => !this.trash.zombies_removed.includes(zombie.id))
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    // console.log(dt)
    this.lastUpdateTime = now;

    // Check collisions between zombies
    this.collisionsBetweenZombies(dt)

    this.bullets.forEach(bullet => {
      this.checkBulletShootPlayers(bullet)
      this.checkBulletShootZombies(bullet)
      this.updateBullet(bullet, dt)
    })

    // Update each player
    Object.keys(this.sockets).forEach(id_socket => {
      const socket = this.sockets[id_socket]
      const player = this.players[id_socket]
      const {x, y, id, hp} = player

      this.createBullets(id, dt)
      this.udpateZombies({x, y, id}, dt)
      this.checkThingsToRemove(id)
      this.checkPlayerIsAlive(socket, {hp, id})
    });

    this.clearTrash()
    this.sendGameUpdate()
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ id: p.id, username: p.username, score: Math.round(p.score), level: p.experience.level }));
  }

  createUpdate({x, y, id}, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(p => {
      return p.id !== id && p.distanceTo({x, y}) <= 1500
    })
    const nearbyBullets = this.bullets.filter(b => {
      return b.distanceTo({x, y}) <= 1500
    })
    const nearbyZombies = this.zombies.filter(z => {
      return z.distanceTo({x, y}) <= 1500
    })
    const nearbyThings = this.things.filter(t => {
      return t.distanceTo({x, y}) <= 1500
    })

    return {
      t: Date.now(),
      me: this.players[id].serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      zombies: nearbyZombies.map(z => z.serializeForUpdate()),
      things: nearbyThings.map(t => t.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
