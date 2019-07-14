const shortid = require('shortid')
const ObjectClass = require('./object')
const Constants = require('../shared/constants')

const options = {
  types: {
    easy: {
      name: 'easy',
      xp: 250,
      damage: 20,
      hp: 50,
      radius: 20
    },
    normal: {
      name: 'normal',
      xp: 500,
      damage: 40,
      hp: 100,
      radius: 20
    },
    hard: {
      name: 'hard',
      xp: 1000,
      damage: 80,
      hp: 200,
      radius: 20
    },
    boss_easy: {
      name: 'boss_easy',
      xp: 5000,
      damage: 150,
      hp: 1000,
      radius: 50
    }
  },
  modes: {
    passive: {
      speed: 50
    },
    active: {
      speed: 215
    },
    returning: {
      speed: 50
    }
  }
}

class Zombie extends ObjectClass {
  constructor(x, y, type, rotate = Math.random() * 2 * Math.PI) {
    super(shortid(), x, y, rotate, 50)
    this.hp = options.types[type].hp
    this.damage = options.types[type].damage
    this.radius = options.types[type].radius
    this.rotate = rotate
    // active or passive behavior
    this.mode = 'passive'
    this.agressiveDistance = 500
    this.type = options.types[type]
    this.changingDirection = true
    this.bite = false
    this.abilities = {
      boss_easy: {
        increaseRadius: (() => {
          this.radius = 80
          setTimeout(() => {
            this.radius = 50
          }, 5000)
        })
      }
    }
    this.useAbility = true
    this.cooldownBite()
  }

  update(dt) {
    super.update(dt)

    // Make sure the zombie stays in bounds
    this.x = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x))
    this.y = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y))

    const inZone = this.checkLocationInZone()
    if (inZone) {
      this.agressiveDistance = 500
    } else {
      this.agressiveDistance = 350
    }

    if (this.useAbility && this.type.name === 'boss_easy' && this.mode === 'active') {
      const abilities = Object.keys(this.abilities.boss_easy)
      const ability = abilities[Math.floor(Math.random() * abilities.length)]
      this.abilities.boss_easy[ability]()

      this.useAbility = false
      setTimeout(() => {
        this.useAbility = true
      }, 10000)
    }
  }

  checkLocationInZone() {
    if (this.type.name === 'easy') {
      if (
        this.x > 0 && this.y > Constants.MAP_SIZE * 0.75 ||
        this.y > 0 && this.x > Constants.MAP_SIZE * 0.75
      ) {
        return true
      }
      return false
    }

    if (this.type.name === 'normal') {
      if (
        (this.x > 0 && this.x < Constants.MAP_SIZE * 0.75) && (this.y > Constants.MAP_SIZE * 0.5 && this.y < Constants.MAP_SIZE * 0.75) ||
        (this.y > 0 && this.y < Constants.MAP_SIZE * 0.75) && (this.x > Constants.MAP_SIZE * 0.5 && this.x < Constants.MAP_SIZE * 0.75)
      ) {
        return true
      }
      return false
    }

    if (this.type.name === 'hard') {
      if (
        (this.x > 0 && this.x < Constants.MAP_SIZE * 0.5) && (this.y > Constants.MAP_SIZE * 0.25 && this.y < Constants.MAP_SIZE * 0.5) ||
        (this.y > 0 && this.y < Constants.MAP_SIZE * 0.5) && (this.x > Constants.MAP_SIZE * 0.25 && this.x < Constants.MAP_SIZE * 0.5)
      ) {
        return true
      }
      return false
    }

    if (this.type.name === 'boss_easy') {
      if (
        (this.x > 0 && this.x < Constants.MAP_SIZE * 0.25) && (this.y > Constants.MAP_SIZE * 0 && this.y < Constants.MAP_SIZE * 0.25) ||
        (this.y > 0 && this.y < Constants.MAP_SIZE * 0.25) && (this.x > Constants.MAP_SIZE * 0 && this.x < Constants.MAP_SIZE * 0.25)
      ) {
        return true
      }
      return false
    }
  }

  takeBulletDamage(bullet) {
    this.hp -= bullet.damage
  }

  setMode(mode) {
    this.mode = mode
    this.speed = options.modes[mode].speed
  }

  resetChangingDirection() {
    this.changingDirection = false
    setTimeout(() => {
      this.changingDirection = true
    }, 5000)
  }

  cooldownBite() {
    this.bite = false
    setTimeout(() => {
      this.bite = true
    }, 1000)
  }

  changeRotate(rotate) {
    this.rotate = rotate
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      hp: this.hp,
      max_hp: this.type.hp,
      rotate: this.rotate,
      radius: this.radius,
      icon: `zombie_${this.type.name}.svg`
    }
  }
}

module.exports = Zombie
