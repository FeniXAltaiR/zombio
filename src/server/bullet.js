const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Bullet extends ObjectClass {
  constructor({parentID, x, y, rotate, radius, speed, damage, distance, effect = null}) {
    super(shortid(), x, y, rotate, speed);
    this.parentID = parentID;
    this.radius = radius
    this.damage = damage
    this.distance = distance
    this.destroyed = false
    this.effect = effect
    setTimeout(() => {
      this.destroyed = true
    }, this.distance / this.speed * 1000)
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);
    this.speed *= 0.99
    this.damage *= 0.99
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE || this.destroyed;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      radius: this.radius,
      effect: this.effect
    };
  }
}

module.exports = Bullet;
