const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y, rotate = Math.random() * 2 * Math.PI) {
    super(id, x, y, null, Constants.PLAYER_SPEED);
    this.username = username;
    this.hp = Constants.PLAYER_MAX_HP;
    this.score = 0;
    this.rotate = rotate
    this.bullet = null
    this.options = {
      weapons: {
        pistol: {
          fire_cooldown: 0.25,
          radius: 5,
          speed: 500,
          damage: 5
        },
        rifle: {
          fire_cooldown: 0.1,
          radius: 7,
          speed: 600,
          damage: 7
        },
        shotgun: {
          fire_cooldown: 0.5,
          radius: 15,
          speed: 400,
          damage: 20
        },
        machinegun: {
          fire_cooldown: 0.05,
          radius: 3,
          speed: 800,
          damage: 5
        }
      }
    }
    this.weapon = null
    this.fireCooldown = 0
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    super.update(dt);

    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    // Update weapon
    this.updateWeapon()

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

  updateWeapon () {
    const score = this.score
    const weapons = this.options.weapons
    if (score > 75) {
      this.weapon = weapons.machinegun
    } else if (score > 50) {
      this.weapon = weapons.shotgun
    } else if (score > 25) {
      this.weapon = weapons.rifle
    } else {
      this.weapon = weapons.pistol
    }
  }

  createBullet() {
    if (this.fireCooldown <= 0) {
      const {radius, speed, damage} = this.weapon

      // this.fireCooldown = Constants.PLAYER_FIRE_COOLDOWN
      this.fireCooldown = this.weapon.fire_cooldown
      this.bullet = new Bullet(this.id, this.x, this.y, this.rotate, radius, speed, damage)
    }
  }

  takeBulletDamage(bullet) {
    this.hp -= bullet.damage
  }

  takeDamage(damage) {
    this.hp -= damage
  }

  onDealtDamage() {
    this.score += Constants.SCORE_BULLET_HIT;
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
    };
  }
}

module.exports = Player;
