const shortid = require('shortid')
const ObjectClass = require('./object')
const Constants = require('../shared/constants')

const {ZOMBIE_RADIUS, ZOMBIE_DAMAGE, ZOMBIE_MAX_HP} = Constants

class Zombie extends ObjectClass {
  constructor(x, y, rotate = Math.random() * 2 * Math.PI) {
    super(shortid(), x, y, rotate, 50)
    this.hp = ZOMBIE_MAX_HP
    this.damage = ZOMBIE_DAMAGE
    this.rotate = rotate
    // active or passive behavior
    this.mode = 'passive'
    this.changingDirection = true
    this.bite = true
    this.options = {
      modes: {
        passive: {
          speed: 50
        },
        active: {
          speed: 215
        }
      }
    }
  }

  update(dt) {
    super.update(dt)

    // Make sure the player stays in bounds
    this.x = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x))
    this.y = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y))
  }

  takeBulletDamage(bullet) {
    this.hp -= bullet.damage
  }

  setMode(mode) {
    this.mode = mode
    this.speed = this.options.modes[mode].speed
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
      rotate: this.rotate
    }
  }
}

module.exports = Zombie
