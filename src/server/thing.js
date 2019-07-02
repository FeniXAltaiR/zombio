const shortid = require('shortid')
const ObjectClass = require('./object')

class Thing extends ObjectClass {
  constructor(x, y, options) {
    super(shortid(), x, y, null, 0)
    this.options = options
  }

  serializeForUpdate() {
    return {
      ...super.serializeForUpdate(),
      icon: this.options.icon
    }
  }
}

module.exports = Thing
