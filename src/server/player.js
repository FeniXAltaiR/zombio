const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');
// const options_player = require('./options-player')

class Player extends ObjectClass {
  constructor(id, username, x, y, rotate = Math.random() * 2 * Math.PI) {
    super(id, x, y, null, 200);
    this.username = username;
    this.hp = 100;
    this.score = 0;
    this.rotate = rotate
    this.bullets = []
    this.weapon = null
    this.fireCooldown = 0
    this.experience = {
      level: 1,
      nextLevel: 0,
      skill_points: 1,
      currentScore: 0
    }
    this.options = {
      parameters: {
        hp: 100,
        speed: 200
      },
      used_skill_points: {
        hp: {
          value: 0,
          color: 'red',
        },
        speed: {
          value: 0,
          color: 'violet',
        },
        accuracy: {
          value: 0,
          color: 'blue',
        }
      },
      passive_skills: {
        speed: 1,
        hp: 1,
        accuracy: 1
      },
      weapons: {
        pistol: {
          name: 'pistol',
          fire_cooldown: 0.45,
          radius: 5,
          speed: 500,
          damage: 5,
          distance: 400,
          noise: 0.3
        },
        uzi: {
          name: 'uzi',
          fire_cooldown: 0.75,
          radius: 3,
          speed: 800,
          damage: 10,
          distance: 500,
          noise: 0.4
        },
        machinegun: {
          name: 'machinegun',
          fire_cooldown: 0.2,
          radius: 5,
          speed: 800,
          damage: 15,
          distance: 600,
          noise: 0.5
        },
        shotgun: {
          name: 'shotgun',
          fire_cooldown: 0.5,
          radius: 7,
          speed: 400,
          damage: 20,
          distance: 200,
          noise: 0
        },
        auto_shotgun: {
          name: 'auto_shotgun',
          fire_cooldown: 0.8,
          radius: 7,
          speed: 400,
          damage: 20,
          distance: 350,
          noise: 0
        },
        rifle: {
          name: 'rifle',
          fire_cooldown: 0.35,
          radius: 5,
          speed: 600,
          damage: 7,
          distance: 400,
          noise: 0.2
        },
        sniper_rifle: {
          name: 'sniper_rifle',
          fire_cooldown: 1,
          radius: 5,
          speed: 1000,
          damage: 50,
          distance: 1000,
          noise: 0
        }
      }
    }
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    super.update(dt);

    // Update weapon
    this.updateWeapon()

    // Make sure the player stays in bounds
    this.x = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x));
    this.y = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y));

    // Fire a bullet, if needed
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt
    }

    if (this.bullets.length) {
      const newBullets = this.bullets
      this.bullets = []
      return newBullets
    }

    return null;
  }

  updateWeapon() {
    const score = this.score
    const weapons = this.options.weapons
    this.weapon = weapons.machinegun
    // if (score > 100) {
    //   this.weapon = weapons.uzi
    // } else if (score > 75) {
    //   this.weapon = weapons.machinegun
    // } else if (score > 50) {
    //   this.weapon = weapons.shotgun
    // } else if (score > 25) {
    //   this.weapon = weapons.rifle
    // } else {
    //   this.weapon = weapons.pistol
    // }
  }

  updateLevel(list) {
    let level, nextLevel, score
    list.find((xp, index) => {
      if (this.score < xp) {
        level = index
        nextLevel = list[index]
        score = this.score - list[index - 1]
        return true
      }
    })
    this.experience.level = level
    this.experience.nextLevel = nextLevel
    this.experience.currentScore = score
  }

  createBullet() {
    if (!this.weapon) {
      return
    }

    if (this.fireCooldown <= 0) {
      const {radius, speed, damage, distance, noise} = this.weapon

      this.fireCooldown = this.weapon.fire_cooldown
      if (this.weapon.name === 'auto_shotgun') {
        this.bullets.push(
          new Bullet(this.id, this.x, this.y, this.rotate - 0.2, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate - 0.1, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate + 0.1, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate + 0.2, radius, speed, damage, distance)
        )
      } else if (this.weapon.name === 'shotgun') {
        this.bullets.push(
          new Bullet(this.id, this.x, this.y, this.rotate - 0.15, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate + 0.15, radius, speed, damage, distance)
        )
      } else if (this.weapon.name === 'uzi') {
        for (let i = 0; i < 3; i++) {
          const rotate = this.rotate + ((Math.random() - 0.5) * (noise * this.options.passive_skills.accuracy))
          setTimeout(() => {
            this.bullets.push(new Bullet(this.id, this.x, this.y, rotate, radius, speed, damage, distance))
          }, i * 100)
        }
      } else {
        const rotate = this.rotate + ((Math.random() - 0.5) * (noise * this.options.passive_skills.accuracy))
        this.bullets.push(new Bullet(this.id, this.x, this.y, rotate, radius, speed, damage, distance))
      }
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

  onKilledZombie(xp) {
    this.score += xp
  }

  takeBuff(buffs) {
    const {speed, hp} = this.options.passive_skills
    Object.keys(buffs).forEach(buff => {
      this[buff] += buffs[buff]
    })

    if (this.hp > this.options.parameters.hp * hp) {
      this.hp = this.options.parameters.hp * hp
    }
  }

  leftSkillPoints() {
    return this.experience.level - this.experience.skill_points
  }

  levelUp(code) {
    const codes = {
      '49': (() => {
        this.options.passive_skills.hp += 0.5
        this.options.used_skill_points.hp.value += 1
      }),
      '50': (() => {
        this.options.passive_skills.speed += 0.25
        this.speed = this.options.passive_skills.speed * this.options.parameters.speed
        this.options.used_skill_points.speed.value += 1
      }),
      '51': (() => {
        this.options.passive_skills.accuracy -= 0.25
        this.options.used_skill_points.accuracy.value += 1
      }),
      // '52': (() => this.speed += 50),
      // '53': (() => this.speed += 50),
      // '54': (() => this.speed += 50),
      // '55': (() => this.speed += 50)
    }

    if (this.leftSkillPoints() > 0 && codes[code]) {
      codes[code]()
      this.experience.skill_points += 1
    }
  }

  changeRotate(rotate) {
    this.rotate = rotate
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      hp: this.hp,
      rotate: this.rotate,
      skill_points: this.leftSkillPoints(),
      experience: this.experience,
      passive_skills: this.options.passive_skills,
      parameters: this.options.parameters,
      used_skill_points: this.options.used_skill_points
    };
  }
}

module.exports = Player;
