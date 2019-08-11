const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');
// const options_player = require('./options-player')

class Player extends ObjectClass {
  constructor(id, username, x, y, icon, rotate = Math.random() * 2 * Math.PI) {
    super(id, x, y, null, Constants.PLAYER_SPEED);
    this.options = {
      parameters: {
        hp: 200,
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
        debuffs: {
          fire: {
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
        ultra_skill: {
          value: null,
          cooldown: false
        },
        teleportation: (skill_name => {
          this.x += Math.sin(this.rotate) * 750
          this.y -= Math.cos(this.rotate) * 750
          this.resetActiveSkill(skill_name, 20000)
        }),
        double_bullets: (skill_name => {
          this.options.active_skills.use_double_bullets = true
          setTimeout(() => {
            this.options.active_skills.use_double_bullets = false
          }, 10000)
          this.resetActiveSkill(skill_name, 30000)
        }),
        fire_bullets: (skill_name => {
          this.options.active_skills.use_fire_bullets = true
          setTimeout(() => {
            this.options.active_skills.use_fire_bullets = false
          }, 10000)
          this.resetActiveSkill(skill_name, 30000)
        }),
        defense: (skill_name => {
          this.options.passive_skills.defense -= 0.35
          setTimeout(() => {
            this.options.passive_skills.defense += 0.35
          }, 10000)
          this.resetActiveSkill(skill_name, 25000)
        }),
        speedup: (skill_name => {
          this.options.passive_skills.speed += 0.5
          setTimeout(() => {
            this.options.passive_skills.speed -= 0.5
          }, 5000)
          this.resetActiveSkill(skill_name, 25000)
        }),
        health: (skill_name => {
          this.updateHp(500)
          this.resetActiveSkill(skill_name, 25000)
        }),
        ultimate: (skill_name => {
          const amount_bullets = 36
          for (let i = 0; i < amount_bullets; i++) {
            const bullet_options = {
              parentID: this.id,
              x: this.x + Math.sin(this.rotate + (Math.PI / (amount_bullets / 2) * i)) * (Constants.PLAYER_RADIUS + 25),
              y: this.y - Math.cos(this.rotate + (Math.PI / (amount_bullets / 2) * i)) * (Constants.PLAYER_RADIUS + 25),
              rotate: this.rotate + (Math.PI / (amount_bullets / 2) * i),
              radius: 10,
              speed: 300,
              damage: 20,
              distance: 1500,
              effect: 'fire'
            }
            this.bullets.push(new Bullet(bullet_options))
          }
          this.resetActiveSkill(skill_name, 30000)
        })
      },
      zones_effects: {
        speed: 0.5,
        defense: 0.5
      },
      killed_bosses: {
        boss_easy: {
          value: false,
          bonus: (() => {
            this.options.passive_skills.hp += 1
          })
        },
        boss_normal: {
          value: false,
          bonus: (() => {
            this.options.passive_skills.cooldown -= 0.1
          })
        },
        boss_hard: {
          value: false,
          bonus: (() => {
            this.options.passive_skills.damage += 0.25
          })
        },
        boss_legend: {
          value: false,
          bonus: (() => {
            this.options.active_skills.ultra_skill.value = 'ultimate'
          })
        }
      },
      buffs: {
        hp: (() => {
          this.updateHp(100)
        }),
        speed: (() => {
          this.options.passive_skills.speed += 0.25
          this.updateSpeed()

          setTimeout(() => {
            this.options.passive_skills.speed -= 0.25
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
          // this.options.passive_skills.speed -= 0.15
          this.updateSpeed()
          setTimeout(() => {
            this.options.passive_skills.defense += 0.25
            // this.options.passive_skills.speed += 0.15
            this.updateSpeed()
          }, 5000)
        }),
        damage: (() => {
          this.options.passive_skills.damage += 0.25

          setTimeout(() => {
            this.options.passive_skills.damage -= 0.25
          }, 5000)
        })
      },
      researches: {
        weapon: 'pistol',
        level: 3,
        'uzi': {
          weapon: 'uzi',
          level: 7,
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
          level: 7,
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
          level: 7,
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
          radius: 5,
          speed: 600,
          damage: 20,
          distance: 500,
          noise: 0.4
        },
        machinegun: {
          name: 'machinegun',
          fire_cooldown: 0.25,
          radius: 5,
          speed: 700,
          damage: 35,
          distance: 800,
          noise: 0.5
        },
        shotgun: {
          name: 'shotgun',
          fire_cooldown: 0.8,
          radius: 7,
          speed: 400,
          damage: 25,
          distance: 400,
          noise: 0
        },
        auto_shotgun: {
          name: 'auto_shotgun',
          fire_cooldown: 0.65,
          radius: 7,
          speed: 400,
          damage: 30,
          distance: 500,
          noise: 0
        },
        rifle: {
          name: 'rifle',
          fire_cooldown: 0.35,
          radius: 6,
          speed: 600,
          damage: 35,
          distance: 700,
          noise: 0.2
        },
        sniper_rifle: {
          name: 'sniper_rifle',
          fire_cooldown: 1,
          radius: 7,
          speed: 1000,
          damage: 120,
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
    this.updateFireCooldown(dt)

    if (this.options.active_skills.debuffs.fire.value) {
      this.updateHp(-10 * dt * 5)
    }

    if (this.bullets.length) {
      const newBullets = this.bullets
      this.bullets = []
      return newBullets
    }

    return null;
  }

  updateFireCooldown(dt) {
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt
    }
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
        this.updateHp(-dt)
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
      '81': 'second_skill',
      '82': 'ultra_skill'
    }
    const skill_name = skills[skill]
    const active_skills = this.options.active_skills
    const active_skill = active_skills[active_skills[skill_name].value]
    if (this.options.active_skills[skill_name].cooldown === false && active_skills[skill_name].value !== null) {
      active_skill(skill_name)
    }
  }

  resetActiveSkill(skill_name, ms) {
    const {cooldown} = this.options.passive_skills
    this.options.active_skills[skill_name].cooldown = true
    setTimeout(() => {
      this.options.active_skills[skill_name].cooldown = false
    }, ms * cooldown)
  }

  activeDebuff(name) {
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
        const {use_fire_bullets} = this.options.active_skills
        if (use_fire_bullets) {
          return 'fire'
        }
        return null
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

  activeBossBonus(boss_name) {
    const boss = this.options.killed_bosses[boss_name]
    if (boss.value === false) {
      boss.value = true
      boss.bonus()
    }
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
    this.score += this.weapon.damage;
  }

  onKilledPlayer(xp) {
    const diff = xp - this.score
    if (diff < 1000) {
      this.score += 1000
    } else {
      this.score += diff
    }
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
        this.options.passive_skills.hp += 0.25
        this.options.used_skill_points.hp.value += 1
      }),
      'speed': (() => {
        this.options.passive_skills.speed += 0.1
        this.updateSpeed()
        this.options.used_skill_points.speed.value += 1
      }),
      'accuracy': (() => {
        this.options.passive_skills.accuracy -= 0.1
        this.options.used_skill_points.accuracy.value += 1
      }),
      'defense': (() => {
        this.options.passive_skills.defense -= 0.05
        this.options.used_skill_points.defense.value += 1
      }),
      'cooldown': (() => {
        this.options.passive_skills.cooldown -= 0.05
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
        use_fire_bullets: this.options.active_skills.use_fire_bullets
      },
      parameters: this.options.parameters,
      used_skill_points: this.options.used_skill_points,
      icon: `player_${this.icon}.svg`,
      weapon: this.weapon.name,
    };
  }
}

module.exports = Player;
