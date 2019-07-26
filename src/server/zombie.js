const shortid = require('shortid')
const ObjectClass = require('./object')
const Constants = require('../shared/constants')

class Zombie extends ObjectClass {
  constructor(x, y, type, rotate = Math.random() * 2 * Math.PI) {
    super(shortid(), x, y, rotate, 50)
    this.options = {
      types: {
        easy: {
          name: 'easy',
          xp: 250,
          damage: 20,
          hp: 50,
          radius: 20
        },
        normal: {
          name: 'normal',
          xp: 500,
          damage: 40,
          hp: 100,
          radius: 20
        },
        hard: {
          name: 'hard',
          xp: 1000,
          damage: 80,
          hp: 200,
          radius: 20
        },
        boss_easy: {
          name: 'boss_easy',
          xp: 5000,
          damage: 150,
          hp: 1000,
          radius: 50
        },
        boss_normal: {
          name: 'boss_normal',
          xp: 10000,
          damage: 200,
          hp: 2000,
          radius: 60
        },
        boss_hard: {
          name: 'boss_hard',
          xp: 15000,
          damage: 250,
          hp: 3000,
          radius: 75
        },
        boss_legend: {
          name: 'boss_legend',
          xp: 25000,
          damage: 300,
          hp: 5000,
          radius: 100
        }
      },
      active_skills: {
        debuffs: {
          fire: {
            value: false,
            timeout: null
          }
        },
      },
      modes: {
        passive: {
          speed: 50
        },
        active: {
          speed: 215
        },
        returning: {
          speed: 50
        }
      }
    }
    this.abilities = {
      use_teleport: false,
      use_create_vampire_bullets: false,
      use_create_fire_bullets: false,
      boss_easy: {
        increaseRadius: (() => {
          this.radius = 80
          this.damage += 20
          setTimeout(() => {
            this.radius = 50
            this.damage -= 20
          }, 5000)
        })
      },
      boss_normal: {
        teleportation: (() => {
          this.abilities.use_teleport = true
        })
      },
      boss_hard: {
        createBullets: (() => {
          this.abilities.use_create_vampire_bullets = true
        })
      },
      boss_legend: {
        increaseSpeed: (() => {
          this.options.modes.active.speed += 50
          this.abilities.use_create_fire_bullets = true
          setTimeout(() => {
            this.options.modes.active.speed -= 50
          }, 5000)
        })
      }
    }
    this.use_ability = true
    this.hp = this.options.types[type].hp
    this.damage = this.options.types[type].damage
    this.radius = this.options.types[type].radius
    this.rotate = rotate
    // active or passive behavior
    this.mode = 'passive'
    this.agressiveDistance = 500
    this.type = this.options.types[type]
    this.changingDirection = true
    this.bite = false
    this.cooldownBite()
  }

  update(dt) {
    super.update(dt)

    // Make sure the zombie stays in bounds
    this.x = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x))
    this.y = Math.max(0 + Constants.PLAYER_RADIUS, Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y))

    const inZone = this.checkLocationInZone()
    if (inZone) {
      this.agressiveDistance = 500
    } else {
      this.agressiveDistance = 350
    }

    if (this.options.active_skills.debuffs.fire.value) {
      this.updateHp(-10 * dt * 5)
    }

    this.useActiveSkill()
  }

  checkLocationInZone() {
    if (['easy', 'boss_easy'].includes(this.type.name)) {
      if (
        this.x > 0 && this.y > Constants.MAP_SIZE * 0.75 ||
        this.y > 0 && this.x > Constants.MAP_SIZE * 0.75
      ) {
        return true
      }
      return false
    }

    if (['normal', 'boss_normal'].includes(this.type.name)) {
      if (
        (this.x > 0 && this.x < Constants.MAP_SIZE * 0.75) && (this.y > Constants.MAP_SIZE * 0.5 && this.y < Constants.MAP_SIZE * 0.75) ||
        (this.y > 0 && this.y < Constants.MAP_SIZE * 0.75) && (this.x > Constants.MAP_SIZE * 0.5 && this.x < Constants.MAP_SIZE * 0.75)
      ) {
        return true
      }
      return false
    }

    if (['hard', 'boss_hard'].includes(this.type.name)) {
      if (
        (this.x > 0 && this.x < Constants.MAP_SIZE * 0.5) && (this.y > Constants.MAP_SIZE * 0.25 && this.y < Constants.MAP_SIZE * 0.5) ||
        (this.y > 0 && this.y < Constants.MAP_SIZE * 0.5) && (this.x > Constants.MAP_SIZE * 0.25 && this.x < Constants.MAP_SIZE * 0.5)
      ) {
        return true
      }
      return false
    }

    if (['boss_legend'].includes(this.type.name)) {
      if (
        (this.x > 0 && this.x < Constants.MAP_SIZE * 0.25) && (this.y > Constants.MAP_SIZE * 0 && this.y < Constants.MAP_SIZE * 0.25) ||
        (this.y > 0 && this.y < Constants.MAP_SIZE * 0.25) && (this.x > Constants.MAP_SIZE * 0 && this.x < Constants.MAP_SIZE * 0.25)
      ) {
        return true
      }
      return false
    }
  }

  useActiveSkill() {
    if (
      this.use_ability &&
      ['boss_easy', 'boss_normal', 'boss_hard', 'boss_legend'].includes(this.type.name) &&
      this.mode === 'active'
    ) {
      const {name: boss_name} = this.type
      const abilities = Object.keys(this.abilities[boss_name])
      const ability = abilities[Math.floor(Math.random() * abilities.length)]
      this.abilities[boss_name][ability]()

      this.use_ability = false
      setTimeout(() => {
        this.use_ability = true
      }, 10000)
    }
  }

  resetActiveSkill(ability) {
    this.abilities[ability] = false
  }

  updateHp(value) {
    const {hp} = this.type
    if (this.hp + value > hp) {
      this.hp = hp
    }
    this.hp += value
  }

  takeBulletDamage(bullet) {
    this.hp -= bullet.damage
  }

  setMode(mode) {
    this.mode = mode
    this.speed = this.options.modes[mode].speed
  }

  resetChangingDirection() {
    this.changingDirection = false
    setTimeout(() => {
      this.changingDirection = true
    }, 5000)
  }

  activeDebuff(name) {
    this.options.active_skills.debuffs[name].value = true
    clearTimeout(this.options.active_skills.debuffs[name].timeout)
    this.options.active_skills.debuffs[name].timeout = setTimeout(() => {
      this.options.active_skills.debuffs[name].value = false
    }, 2500)
  }

  cooldownBite() {
    this.bite = false
    setTimeout(() => {
      this.bite = true
    }, 1000)
  }

  changeRotate(rotate) {
    this.rotate = rotate
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      hp: this.hp,
      max_hp: this.type.hp,
      rotate: this.rotate,
      radius: this.radius,
      icon: `zombie_${this.type.name}.svg`
    }
  }
}

module.exports = Zombie
