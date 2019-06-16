const shortid = require('shortid')
const ObjectClass = require('./object')
const Constants = require('../shared/constants')

const {ZOMBIE_SPEED, ZOMBIE_RADIUS, ZOMBIE_DAMAGE, ZOMBIE_MAX_HP} = Constants

class Zombie extends ObjectClass {
  constructor(x, y) {
    super(shortid(), x, y, null, ZOMBIE_SPEED)
    this.hp = ZOMBIE_MAX_HP
    this.damage = ZOMBIE_DAMAGE
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
      hp: this.hp
    }
  }
}

module.exports = Zombie
