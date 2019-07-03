const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');
// const options_player = require('./options-player')

class Player extends ObjectClass {
  constructor(id, username, x, y, icon, rotate = Math.random() * 2 * Math.PI) {
    super(id, x, y, null, Constants.PLAYER_SPEED);
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
        accuracy: 1,
        defense: 1
      },
      zones_effects: {
        speed: 0.5,
        defense: 0.5
      },
      buffs: {
        hp: (() => {
          this.updateHp(100)
        }),
        speed: (() => {
          this.options.passive_skills.speed += 1
          this.updateSpeed()

          setTimeout(() => {
            this.options.passive_skills.speed -= 1
            this.updateSpeed()
          }, 5000)
        }),
        accuracy: (() => {
          const {accuracy} = this.options.passive_skills
          let diff = 0.5

          if (accuracy - diff < 0) {
            diff = accuracy
            this.options.passive_skills.accuracy -= diff
          } else {
            this.options.passive_skills.accuracy -= diff
          }

          setTimeout(() => {
            this.options.passive_skills.accuracy += diff
          }, 5000)
        })
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
    this.statistic = {
      amount_bullets: 0,
      amount_things: 0,
      amount_zombies: 0,
      amount_recovery_hp: 0
    }
    this.username = username;
    this.icon = icon
    this.hp = this.options.parameters.hp;
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
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    super.update(dt);

    // Update weapon
    this.updateWeapon()

    // Make sure the player stays in bounds
    this.x = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x));
    this.y = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y));

    // Check player, where he is
    this.checkZonePlayer(dt)

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

  checkZonePlayer (dt) {
    const getZoneBounds = (boundsA, boundsB) => {
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

    const resetZonesEffects = () => {
      const effects = this.options.zones_effects
      this.updateSpeed()
      effects.speed = 0
      effects.defense = 0
    }

    const zones = {
      green: (dt => {
        this.updateHp(dt)
      }),
      yellow: (dt => {
        this.options.zones_effects.speed = -0.25
      }),
      violet: (dt => {
        this.options.zones_effects.defense = -0.25
      }),
      red: (dt => {
        this.hp -= dt
      })
    }

    resetZonesEffects()

    if (getZoneBounds(1, 0.75)) {
      zones.green(dt)
    }
    else if (getZoneBounds(0.75, 0.5)) {
      zones.yellow(dt)
    }
    else if (getZoneBounds(0.5, 0.25)) {
      zones.violet(dt)
    }
    else if (getZoneBounds(0.25, 0)) {
      zones.red(dt)
    }
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
        this.updateStatistic('amount_bullets', 5)
      } else if (this.weapon.name === 'shotgun') {
        this.bullets.push(
          new Bullet(this.id, this.x, this.y, this.rotate - 0.15, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate, radius, speed, damage, distance),
          new Bullet(this.id, this.x, this.y, this.rotate + 0.15, radius, speed, damage, distance)
        )
        this.updateStatistic('amount_bullets', 3)
      } else if (this.weapon.name === 'uzi') {
        for (let i = 0; i < 3; i++) {
          const rotate = this.rotate + ((Math.random() - 0.5) * (noise * this.options.passive_skills.accuracy))
          setTimeout(() => {
            this.bullets.push(new Bullet(this.id, this.x, this.y, rotate, radius, speed, damage, distance))
          }, i * 100)
        }
        this.updateStatistic('amount_bullets', 3)
      } else {
        const rotate = this.rotate + ((Math.random() - 0.5) * (noise * this.options.passive_skills.accuracy))
        this.bullets.push(new Bullet(this.id, this.x, this.y, rotate, radius, speed, damage, distance))
        this.updateStatistic('amount_bullets', 1)
      }
    }
  }

  updateStatistic(property, value) {
    this.statistic[property] += value
  }

  takeBulletDamage(bullet) {
    const {defense} = this.options.passive_skills
    const value = bullet.damage * (defense - this.options.zones_effects.defense)
    this.hp -= value
  }

  takeDamage(damage) {
    const {defense} = this.options.passive_skills
    const value = damage * (defense - this.options.zones_effects.defense)
    this.hp -= value
  }

  onDealtDamage() {
    this.score += Constants.SCORE_BULLET_HIT;
  }

  onKilledZombie(xp) {
    this.score += xp
    this.updateStatistic('amount_zombies', 1)
  }

  takeBuff(name) {
    const buff = this.options.buffs[name]
    buff()
    this.updateStatistic('amount_things', 1)
  }

  leftSkillPoints() {
    return this.experience.level - this.experience.skill_points
  }

  updateSpeed() {
    this.speed = this.options.parameters.speed * (this.options.passive_skills.speed + this.options.zones_effects.speed)
  }

  updateHp(value) {
    const {hp} = this.options.passive_skills
    if (this.hp + value > this.options.parameters.hp * hp) {
      this.hp = this.options.parameters.hp * hp
      this.updateStatistic('amount_recovery_hp', this.options.parameters.hp * hp - this.hp)
    } else {
      this.hp += value
      this.updateStatistic('amount_recovery_hp', value)
    }
  }

  levelUp(code) {
    const codes = {
      '49': (() => {
        this.options.passive_skills.hp += 0.5
        this.options.used_skill_points.hp.value += 1
      }),
      '50': (() => {
        this.options.passive_skills.speed += 0.25
        this.updateSpeed()
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
      used_skill_points: this.options.used_skill_points,
      icon: `player_${this.icon}.svg`
    };
  }
}

module.exports = Player;
