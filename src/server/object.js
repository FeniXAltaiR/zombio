const Constants = require('../shared/constants')

class Object {
  constructor(id, x, y, dir, speed) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.speed = speed;
    this.lastShot = null
    this.oldDirection = {
      x: null,
      y: null
    }
  }

  update(dt) {
    if (this.direction === null) {
      const {x, y} = this.oldDirection
      this.x += dt * this.speed * x
      this.y -= dt * this.speed * y
    } else {
      this.oldDirection.x = Math.sin(this.direction)
      this.oldDirection.y = Math.cos(this.direction)
      this.x += dt * this.speed * this.oldDirection.x
      this.y -= dt * this.speed * this.oldDirection.y
    }
  }

  distanceTo(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getZoneBounds(boundsA, boundsB) {
    if (
      this.x > 0 &&
      this.x < Constants.MAP_SIZE * boundsA &&
      this.y > Constants.MAP_SIZE * boundsB &&
      this.y < Constants.MAP_SIZE * boundsA ||
      this.y > 0 &&
      this.y < Constants.MAP_SIZE * boundsA &&
      this.x > Constants.MAP_SIZE * boundsB &&
      this.x < Constants.MAP_SIZE * boundsA
    ) {
      return true
    }
    return false
  }

  setDirection(dir) {
    this.direction = dir;
  }

  udpateLastShot(id) {
    this.lastShot = id
  }

  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }
}

module.exports = Object;
