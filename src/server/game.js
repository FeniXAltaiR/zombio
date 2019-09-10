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
    this.options = {
      xp_levels: createXpList(),
      // things: ['hp', 'speed', 'accuracy', 'portal', 'defense', 'damage'],
      things: {
        hp: {
          radius: 20,
          amount: 55
        },
        speed: {
          radius: 20,
          amount: 55
        },
        accuracy: {
          radius: 20,
          amount: 55
        },
        portal: {
          radius: 28,
          amount: 25
        },
        defense: {
          radius: 20,
          amount: 55
        },
        damage: {
          radius: 20,
          amount: 55
        }
      },
      zombies: {
        easy: {
          amount: 180,
          bounds: [1, 0.75]
        },
        normal: {
          amount: 140,
          bounds: [0.75, 0.5]
        },
        hard: {
          amount: 100,
          bounds: [0.5, 0.25]
        },
        boss_easy: {
          amount: 10,
          bounds: [1, 0.75]
        },
        boss_normal: {
          amount: 5,
          bounds: [0.75, 0.5]
        },
        boss_hard: {
          amount: 3,
          bounds: [0.5, 0.25]
        },
        boss_legend: {
          amount: 1,
          bounds: [0.25, 0]
        }
      }
    }
    this.createZombies()
    setInterval(this.respawnZombies.bind(this), 60000)
    this.createThings()
    setInterval(this.respawnThings.bind(this), 60000)
    this.trash = {
      bullets_removed: [],
      zombies_removed: [],
      things_removed: []
    }
    // tests
    this.operations = 0
  }

  createZombie (x, y, type) {
    const zombie = new Zombie(x, y, type)
    this.zombies.push(zombie)
  }

  createZombies() {
    Object.keys(this.options.zombies).forEach(type => {
      const {amount} = this.options.zombies[type]
      const [boundsA, boundsB] = this.options.zombies[type].bounds
      for (let i = 0; i < amount; i++) {
        const [x, y] = this.respawnCoords(boundsA, boundsB, this.checkPlayersInRadius.bind(this))
        this.createZombie(x, y, type)
      }
    })
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

    Object.keys(this.options.zombies).forEach(type => {
      const {amount} = this.options.zombies[type]
      const [boundsA, boundsB] = this.options.zombies[type].bounds
      for (let i = zombieTypes[type] || 0; i < amount; i++) {
        const [x, y] = this.respawnCoords(boundsA, boundsB, this.checkPlayersInRadius.bind(this))
        this.createZombie(x, y, type)
      }
    })
  }

  createThing(name) {
    const [x, y] = [Math.random() * Constants.MAP_SIZE, Math.random() * Constants.MAP_SIZE]
    const options = {
      name,
      icon: `thing_${name}.svg`
    }
    const thing = new Thing({
      x,
      y,
      radius: this.options.things[name].radius,
      options
    })
    this.things.push(thing)
  }

  createThings () {
    Object.keys(this.options.things).forEach(name => {
      for (let i = 0; i < this.options.things[name].amount; i++) {
        this.createThing(name)
      }
    })
  }

  respawnThings() {
    const thingTypes = this.things.reduce((total, thing) => {
      const {name} = thing.options
      if (total[name]) {
        total[name] += 1
        return total
      }
      total[name] = 1
      return total
    }, {})

    Object.keys(this.options.things).forEach(name => {
      for (let i = thingTypes[name] || 0; i < this.options.things[name].amount; i++) {
        this.createThing(name)
      }
    })
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

  // Update zombies
  updateZombies(dt) {
    this.zombies.forEach(zombie => {
      const findCloserPlayer = Object.values(this.players)
        .find(player => zombie.distanceTo({x: player.x, y: player.y}) < zombie.agressiveDistance && player.mode !== 'dead')

      if (findCloserPlayer) {
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

      if (zombie.mode === 'active' && findCloserPlayer) {
        const dir = Math.atan2(findCloserPlayer.x - zombie.x, zombie.y - findCloserPlayer.y)
        zombie.setDirection(dir)
        zombie.changeRotate(dir)
      }

      if (zombie.mode === 'passive' && zombie.changingDirection) {
        const dir = Math.atan2(Math.random() * 2 - 1, Math.random() * 2 - 1)
        zombie.setDirection(dir)
        zombie.changeRotate(dir)
        zombie.resetChangingDirection()
      }

      if (findCloserPlayer) {
        this.useActiveSkillZombies(zombie, findCloserPlayer)
      }

      if (this.shouldSendUpdate) {
        this.collisionsBetweenPlayersAndZombies(zombie)

        // Check collisions between zombies
        this.collisionsBetweenZombies(zombie, dt)
      }

      // Check if any zombie has destroyed
      this.checkZombieIsAlive(zombie)

      zombie.update(dt)
    })
  }

  collisionsBetweenPlayersAndZombies(zombie) {
    if (zombie.bite) {
      const findCloserPlayer = Object.values(this.players)
        .find(player => player.distanceTo({x: zombie.x, y: zombie.y}) <= Constants.PLAYER_RADIUS + zombie.radius / 1.5 && player.mode !== 'dead')

      if (findCloserPlayer) {
        this.players[findCloserPlayer.id].takeBiteDamage(zombie.damage)
        zombie.cooldownBite()
      }
    }
  }

  collisionsBetweenZombies(zombie, dt) {
    const findCloserZombie = this.zombies
      .find(
        secondZombie =>
          zombie.distanceTo({x: secondZombie.x, y: secondZombie.y}) < zombie.radius + secondZombie.radius &&
          secondZombie.id !== zombie.id
      )

    if (findCloserZombie) {
      const dir = Math.atan2(zombie.x - findCloserZombie.x, findCloserZombie.y - zombie.y)
      zombie.setDirection(dir)
      findCloserZombie.setDirection(-dir)
      if (['passive', 'returning'].includes(zombie.mode) || ['passive', 'returning'].includes(findCloserZombie.mode) ) {
        zombie.changeRotate(dir)
        findCloserZombie.changeRotate(-dir)
        zombie.setMode('passive')
        findCloserZombie.setMode('passive')
      }
      zombie.update(dt)
      findCloserZombie.update(dt)
    }
  }

  useActiveSkillZombies(zombie, player) {
    const boss_normal = () => {
      if (zombie.abilities.use_teleport) {
        const distance = zombie.distanceTo({x: player.x, y: player.y})
        zombie.x += Math.sin(zombie.rotate) * (distance + 250)
        zombie.y -= Math.cos(zombie.rotate) * (distance + 250)
        zombie.abilities.use_teleport = false
      }
    }

    const boss_hard = () => {
      if (zombie.abilities.use_create_vampire_bullets) {
        const amount_bullets = 24
        for (let i = 0; i < amount_bullets; i++) {
          const bullet_options = {
            parentID: zombie.id,
            x: zombie.x + Math.sin(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
            y: zombie.y - Math.cos(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
            rotate: zombie.rotate + (Math.PI / (amount_bullets / 2) * i),
            radius: 12,
            speed: 300,
            damage: 20,
            distance: 1500,
            effect: 'vampire'
          }
          this.bullets.push(new Bullet(bullet_options))
        }
        zombie.resetActiveSkill('use_create_vampire_bullets')
      }
    }

    const boss_legend = () => {
      if (zombie.abilities.use_create_fire_bullets) {
        const amount_bullets = 36
        for (let i = 0; i < amount_bullets; i++) {
          const bullet_options = {
            parentID: zombie.id,
            x: zombie.x + Math.sin(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
            y: zombie.y - Math.cos(zombie.rotate + (Math.PI / (amount_bullets / 2) * i)) * (zombie.radius + 25),
            rotate: zombie.rotate + (Math.PI / (amount_bullets / 2) * i),
            radius: 15,
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

    if (zombie.mode === 'active') {
      const boss_type = zombie.type.name
      
      if (boss_type === 'boss_normal') {
        boss_normal()
      }

      if (boss_type === 'boss_hard') {
        boss_hard()
      }

      if (boss_type === 'boss_legend') {
        boss_legend()
      }
    }
  }

  checkZombieIsAlive(zombie) {
    if (zombie.hp <= 0) {
      const rand = Math.random()
      if (rand > 0.95) {
        const {x, y} = zombie
        const options = {
          name: 'hp',
          icon: `thing_hp.svg`
        }
        const thing = new Thing({
          x,
          y,
          radius: this.options.things.hp.radius,
          options
        })
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
  }
  //

  // Update players
  checkPlayerIsAlive(socket, {hp, id}) {
    const player = this.players[id]
    player.updateLevel(this.options.xp_levels)

    if (hp <= 0 && player.mode !== 'dead') {
      const lastShot = player.lastShot
      if (lastShot !== null && this.players[lastShot]) {
        this.players[lastShot].udpateLastShot(null)
        this.players[lastShot].onKilledPlayer(player.score)
        this.players[lastShot].updateHp(75)
      }
      player.setMode('dead')
      const {statistic, score} = this.players[id]
      setTimeout(() => {
        socket.emit(Constants.MSG_TYPES.GAME_OVER, this.players[id].statistic);
        socket.emit(Constants.MSG_TYPES.SAVE_ID_PLAYER, {
          id,
          score: this.players[id].score
        });
        this.removePlayer(socket);
      }, 3500)
    }
  }

  checkThingsToRemove(id) {
    this.things.forEach(thing => {
      const {x, y, radius} = thing
      if (this.players[id].distanceTo({x, y}) <= Constants.PLAYER_RADIUS + radius) {
        this.players[id].takeBuff(thing.options.name)
        this.trash.things_removed.push(thing.id)
      }
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

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      // .slice(0, 5)
      .map((p, position) => ({
        id: p.id,
        username: p.username,
        score: Math.round(p.score),
        level: p.experience.level,
        position: position + 1
      }));
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

  // Update bullets
  checkBulletShootPlayers({x, y, parentID, damage, radius, effect, id}) {
    const player = Object.values(this.players)
      .find(closerPlayer =>
        parentID !== closerPlayer.id &&
        closerPlayer.distanceTo({x, y}) <= Constants.PLAYER_RADIUS + radius
      )

    if (player) {
      if (damage < player.hp) {
        this.trash.bullets_removed.push(id)
      }
      player.takeBulletDamage({damage})
      player.udpateLastShot(parentID)
      if (this.players[parentID]) {
        this.players[parentID].onDealtDamage(damage);
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
          findZombie.updateHp(damage * 20)
        }
      }
    }
  }

  checkBulletShootZombies({x, y, parentID, damage, radius, effect, id}) {
    const zombie = this.zombies
      .find(closerZombie =>
        parentID !== closerZombie.id &&
        closerZombie.distanceTo({x, y}) <= closerZombie.radius + radius
      )

    if (zombie) {
      if (damage < zombie.hp) {
        this.trash.bullets_removed.push(id)
      }
      zombie.takeBulletDamage({damage})
      zombie.udpateLastShot(parentID)
      if (this.players[parentID]) {
        this.players[parentID].onDealtDamage(damage);
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
  }

  updateBullet(bullet, dt) {
    if (bullet.update(dt)) {
      this.trash.bullets_removed.push(bullet.id);
    }
  }

  // Update trash
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

    // Update each bullet
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
      this.checkThingsToRemove(id)
      this.checkPlayerIsAlive(socket, {hp, id})
    });

    // Update each zombie
    this.updateZombies(dt)

    this.clearTrash()
    this.sendGameUpdate()
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
