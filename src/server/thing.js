const shortid = require('shortid')
const ObjectClass = require('./object')

class Thing extends ObjectClass {
  constructor({x, y, radius, options}) {
    super(shortid(), x, y, null, 0)
    this.radius = radius
    this.options = options
  }

  serializeForUpdate() {
    return {
      ...super.serializeForUpdate(),
      radius: this.radius,
      icon: this.options.icon
    }
  }
}

module.exports = Thing
