const shortid = require('shortid')
const ObjectClass = require('./object')
const Constants = require('../shared/constants')

const {ZOMBIE_SPEED, ZOMBIE_RADIUS, ZOMBIE_DAMAGE, ZOMBIE_MAX_HP} = Constants

class Zombie extends ObjectClass {
  constructor(x, y, rotate = Math.random() * 2 * Math.PI) {
    super(shortid(), x, y, rotate, ZOMBIE_SPEED)
    this.hp = ZOMBIE_MAX_HP
    this.damage = ZOMBIE_DAMAGE
    this.rotate = rotate
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
