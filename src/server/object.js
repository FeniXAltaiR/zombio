const Constants = require('../shared/constants')

class Object {
  constructor(id, x, y, dir, speed) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.speed = speed;
    this.lastShot = null
  }

  update(dt) {
    if (this.direction === null) {
      return
    }
    
    this.x += dt * this.speed * Math.sin(this.direction);
    this.y -= dt * this.speed * Math.cos(this.direction);
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
