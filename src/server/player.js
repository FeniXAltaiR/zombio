const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');
// const options_player = require('./options-player')

class Player extends ObjectClass {
  constructor(id, username, x, y, icon, rotate = Math.random() * 2 * Math.PI) {
    super(id, x, y, null, Constants.PLAYER_SPEED);
    this.options = {
      parameters: {
        hp: 1000,
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
        },
        defense: {
          value: 0,
          color: 'lightblue',
        },
        cooldown: {
          value: 0,
          color: 'greenyellow',
        }
      },
      passive_skills: {
        speed: 1,
        hp: 1,
        accuracy: 1,
        defense: 1,
        damage: 1,
        cooldown: 1
      },
      active_skills: {
        use_double_bullets: false,
        use_fire_bullets: false,
        use_freeze_bullets: false,
        debuffs: {
          firing: {
            value: false,
            timeout: null
          },
          freezing: {
            value: false,
            timeout: null
          }
        },
        first_skill: {
          value: null,
          cooldown: false
        },
        second_skill: {
          value: null,
          cooldown: false
        },
        teleportation: (skill_name => {
          this.x += Math.sin(this.rotate) * 750
          this.y -= Math.cos(this.rotate) * 750
          this.resetActiveSkill(skill_name, 10000)
        }),
        double_bullets: (skill_name => {
          this.options.active_skills.use_double_bullets = true
          setTimeout(() => {
            this.options.active_skills.use_double_bullets = false
          }, 10000)
          this.resetActiveSkill(skill_name, 20000)
        }),
        fire_bullets: (skill_name => {
          this.options.active_skills.use_fire_bullets = true
          setTimeout(() => {
            this.options.active_skills.use_fire_bullets = false
          }, 10000)
          this.resetActiveSkill(skill_name, 20000)
        }),
        freeze_bullets: (skill_name => {
          this.options.active_skills.use_freeze_bullets = true
          setTimeout(() => {
            this.options.active_skills.use_freeze_bullets = false
          }, 10000)
          this.resetActiveSkill(skill_name, 20000)
        }),
        speedup: (skill_name => {
          this.options.passive_skills.speed += 0.5
          setTimeout(() => {
            this.options.passive_skills.speed -= 0.5
          }, 5000)
          this.resetActiveSkill(skill_name, 10000)
        }),
        health: (skill_name => {
          this.updateHp(50)
          this.resetActiveSkill(skill_name, 10000)
        })
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
        }),
        portal: (() => {
          this.x = Constants.MAP_SIZE * Math.random()
          this.y = Constants.MAP_SIZE * Math.random()
        }),
        defense: (() => {
          this.options.passive_skills.defense -= 0.25

          setTimeout(() => {
            this.options.passive_skills.defense += 0.25
          }, 5000)
        }),
        damage: (() => {
          this.options.passive_skills.damage += 1

          setTimeout(() => {
            this.options.passive_skills.damage -= 1
          }, 5000)
        })
      },
      researches: {
        weapon: 'pistol',
        level: 2,
        'uzi': {
          weapon: 'uzi',
          level: 3,
          'machinegun': {
            weapon: 'machinegun',
          },
          'sniper_rifle': {
            weapon: 'sniper_rifle'
          },
          'auto_shotgun': {
            weapon: 'auto_shotgun'
          }
        },
        'rifle': {
          weapon: 'rifle',
          level: 3,
          'machinegun': {
            weapon: 'machinegun',
          },
          'sniper_rifle': {
            weapon: 'sniper_rifle'
          },
          'auto_shotgun': {
            weapon: 'auto_shotgun'
          }
        },
        'shotgun': {
          weapon: 'shotgun',
          level: 3,
          'machinegun': {
            weapon: 'machinegun',
          },
          'sniper_rifle': {
            weapon: 'sniper_rifle'
          },
          'auto_shotgun': {
            weapon: 'auto_shotgun'
          }
        }
      },
      weapons: {
        pistol: {
          name: 'pistol',
          fire_cooldown: 0.45,
          radius: 5,
          speed: 500,
          damage: 25,
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
          damage: 25,
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
    this.weapon = this.options.weapons.pistol
    this.research = this.options.researches
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

    // Make sure the player stays in bounds
    this.x = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x));
    this.y = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y));

    // Check player, where he is
    this.checkZonePlayer(dt)

    // Fire a bullet, if needed
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt
    }

    if (this.options.active_skills.debuffs.firing.value) {
      this.updateHp(-10 * dt * 5)
    } else if (this.options.active_skills.debuffs.freezing.value) {
      this.updateHp(-10 * dt * 2.5)
    }

    if (this.bullets.length) {
      const newBullets = this.bullets
      this.bullets = []
      return newBullets
    }

    return null;
  }

  checkZonePlayer (dt) {
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

    if (this.getZoneBounds(1, 0.75)) {
      zones.green(dt)
    }
    else if (this.getZoneBounds(0.75, 0.5)) {
      zones.yellow(dt)
    }
    else if (this.getZoneBounds(0.5, 0.25)) {
      zones.violet(dt)
    }
    else if (this.getZoneBounds(0.25, 0)) {
      zones.red(dt)
    }
  }

  updateWeapon(weapon_name) {
    const {level} = this.experience
    const {weapons} = this.options
    if (this.research.level && level >= this.research.level && this.research[weapon_name]) {
      this.research = this.research[weapon_name]
      this.weapon = weapons[this.research.weapon]
    }
  }

  addNewSkill(skill_name) {
    const {first_skill, second_skill} = this.options.active_skills
    if (first_skill.value === null) {
      first_skill.value = skill_name
    } else {
      second_skill.value = skill_name
    }
  }

  useActiveSkill(skill) {
    const skills = {
      '69': 'first_skill',
      '81': 'second_skill'
    }
    const skill_name = skills[skill]
    const active_skills = this.options.active_skills
    const active_skill = active_skills[active_skills[skill_name].value]
    if (this.options.active_skills[skill_name].cooldown === false && active_skills[skill_name].value !== null) {
      active_skill(skill_name)
    }
  }

  resetActiveSkill(skill_name, ms) {
    this.options.active_skills[skill_name].cooldown = true
    setTimeout(() => {
      this.options.active_skills[skill_name].cooldown = false
    }, ms)
  }

  activeDebuff(name) {
    // let {value, timeout} = this.options.active_skills.debuffs[name]
    // value = true
    this.options.active_skills.debuffs[name].value = true
    clearTimeout(this.options.active_skills.debuffs[name].timeout)
    this.options.active_skills.debuffs[name].timeout = setTimeout(() => {
      this.options.active_skills.debuffs[name].value = false
    }, 2500)
  }

  updateLevel(list) {
    for (let i = 0; i < list.length; i++) {
      const xp = list[i]
      if (this.score < xp) {
        this.experience.level = i
        this.experience.nextLevel = xp - (list[i - 1] ? list[i - 1] : 0)
        this.experience.currentScore = this.score - list[i - 1]
        break
      }
    }
  }

  createBullet() {
    if (!this.weapon) {
      return
    }

    if (this.fireCooldown <= 0) {
      const {radius, speed, damage, distance, noise} = this.weapon
      const modDamage = damage * this.options.passive_skills.damage
      const getRotate = () => {
        return this.rotate + ((Math.random() - 0.5) * (noise * this.options.passive_skills.accuracy))
      }
      const getBulletEffect = () => {
        const {use_fire_bullets, use_freeze_bullets} = this.options.active_skills
        if (use_fire_bullets) {
          return 'fire'
        } else if (use_freeze_bullets) {
          return 'freeze'
        } else {
          return null
        }
      }
      const bullet_options = {
        parentID: this.id,
        x: this.x,
        y: this.y,
        rotate: this.rotate,
        radius,
        speed,
        damage: modDamage,
        distance,
        effect: getBulletEffect()
      }

      this.fireCooldown = this.weapon.fire_cooldown
      if (this.weapon.name === 'auto_shotgun') {
        const rotates = [-0.2, -0.1, 0, 0.1, 0.2]
        if (this.options.active_skills.use_double_bullets) {
          this.bullets = rotates.reduce((bullets, rotate) => {
            return bullets.concat(
              new Bullet({
                ...bullet_options,
                x: this.x + Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
                y: this.y + Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
                rotate: this.rotate + rotate
              }),
              new Bullet({
                ...bullet_options,
                x: this.x - Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
                y: this.y - Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
                rotate: this.rotate + rotate
              }),
            )
          }, [])
        } else {
          this.bullets = rotates.map(rotate => {
            return new Bullet({
              ...bullet_options,
              rotate: this.rotate + rotate,
            })
          })
        }
      } else if (this.weapon.name === 'shotgun') {
        const rotates = [-0.15, 0, 0.15]
        if (this.options.active_skills.use_double_bullets) {
          this.bullets = rotates.reduce((bullets, rotate) => {
            return bullets.concat(
              new Bullet({
                ...bullet_options,
                x: this.x + Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
                y: this.y + Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
                rotate: this.rotate + rotate
              }),
              new Bullet({
                ...bullet_options,
                x: this.x - Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
                y: this.y - Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
                rotate: this.rotate + rotate
              }),
            )
          }, [])
        } else {
          this.bullets = rotates.map(rotate => {
            return new Bullet({
              ...bullet_options,
              rotate: this.rotate + rotate,
            })
          })
        }
      } else if (this.weapon.name === 'uzi') {
        if (this.options.active_skills.use_double_bullets) {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              this.bullets = [
                new Bullet({
                  ...bullet_options,
                  x: this.x + Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
                  y: this.y + Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
                  rotate: getRotate()
                }),
                new Bullet({
                  ...bullet_options,
                  x: this.x - Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
                  y: this.y - Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
                  rotate: getRotate()
                })
              ]
            }, i * 100)
          }
        } else {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              this.bullets.push(new Bullet({
                ...bullet_options,
                rotate: getRotate()
              }))
            }, i * 100)
          }
        }
      } else {
        if (this.options.active_skills.use_double_bullets) {
          this.bullets = [
            new Bullet({
              ...bullet_options,
              x: this.x + Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
              y: this.y + Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
              rotate: getRotate()
            }),
            new Bullet({
              ...bullet_options,
              x: this.x - Math.cos(this.rotate) * Constants.PLAYER_RADIUS,
              y: this.y - Math.sin(this.rotate) * Constants.PLAYER_RADIUS,
              rotate: getRotate()
            })
          ]
        } else {
          this.bullets.push(new Bullet({
            ...bullet_options,
            rotate: getRotate()
          }))
        }
      }

      this.updateStatistic('amount_bullets', this.bullets.length)
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

  takeBiteDamage(damage) {
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
    const skills = {
      '49': 'hp',
      '50': 'speed',
      '51': 'accuracy',
      '52': 'defense',
      '53': 'cooldown'
    }
    const codes = {
      'hp': (() => {
        this.options.passive_skills.hp += 0.5
        this.options.used_skill_points.hp.value += 1
      }),
      'speed': (() => {
        this.options.passive_skills.speed += 0.25
        this.updateSpeed()
        this.options.used_skill_points.speed.value += 1
      }),
      'accuracy': (() => {
        this.options.passive_skills.accuracy -= 0.1
        this.options.used_skill_points.accuracy.value += 1
      }),
      'defense': (() => {
        this.options.passive_skills.defense -= 0.1
        this.options.used_skill_points.defense.value += 1
      }),
      'cooldown': (() => {
        this.options.passive_skills.cooldown -= 0.1
        this.options.used_skill_points.cooldown.value += 1
      })
    }
    const skill = skills[code]

    if (
      this.leftSkillPoints() > 0 &&
      codes[skill] &&
      this.options.used_skill_points[skill].value < 7
    ) {
      codes[skill]()
      this.experience.skill_points += 1
    }

    this.updateWeapon(code)
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
      active_skills: {
        first_skill: this.options.active_skills.first_skill,
        second_skill: this.options.active_skills.second_skill,
        use_fire_bullets: this.options.active_skills.use_fire_bullets,
        use_freeze_bullets: this.options.active_skills.use_freeze_bullets
      },
      parameters: this.options.parameters,
      used_skill_points: this.options.used_skill_points,
      icon: `player_${this.icon}.svg`,
      weapon: this.weapon.name,
    };
  }
}

module.exports = Player;
