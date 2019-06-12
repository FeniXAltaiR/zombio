const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y, rotate = Math.random() * 2 * Math.PI) {
    super(id, x, y, null, Constants.PLAYER_SPEED);
    this.username = username;
    this.hp = Constants.PLAYER_MAX_HP;
    this.fireCooldown = Constants.PLAYER_FIRE_COOLDOWN;
    this.score = 0;
    this.rotate = rotate
    this.bullet = null
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    super.update(dt);

    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.x = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x));
    this.y = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y));

    // Fire a bullet, if needed
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt
    }

    if (this.bullet) {
      const newBullet = this.bullet
      this.bullet = null
      return newBullet
    }

    return null;
  }

  takeBulletDamage() {
    this.hp -= Constants.BULLET_DAMAGE;
  }

  onDealtDamage() {
    this.score += Constants.SCORE_BULLET_HIT;
  }

  changeRotate(rotate) {
    this.rotate = rotate
  }

  createBullet() {
    if (this.fireCooldown <= 0) {
      this.fireCooldown = Constants.PLAYER_FIRE_COOLDOWN
      this.bullet = new Bullet(this.id, this.x, this.y, this.rotate)
    }
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      hp: this.hp,
      rotate: this.rotate
    };
  }
}

module.exports = Player;
