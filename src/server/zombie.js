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
          xp: 500,
          damage: 10,
          hp: 100,
          radius: 25,
          speed: 285,
        },
        normal: {
          name: 'normal',
          xp: 1000,
          damage: 25,
          hp: 175,
          radius: 25,
          speed: 315,
        },
        hard: {
          name: 'hard',
          xp: 2000,
          damage: 50,
          hp: 240,
          radius: 25,
          speed: 360,
        },
        boss_easy: {
          name: 'boss_easy',
          xp: 10000,
          damage: 75,
          hp: 1000,
          radius: 55,
          speed: 305,
        },
        boss_normal: {
          name: 'boss_normal',
          xp: 20000,
          damage: 100,
          hp: 2000,
          radius: 65,
          speed: 335,
        },
        boss_hard: {
          name: 'boss_hard',
          xp: 30000,
          damage: 125,
          hp: 3000,
          radius: 80,
          speed: 365,
        },
        boss_legend: {
          name: 'boss_legend',
          xp: 50000,
          damage: 175,
          hp: 5000,
          radius: 100,
          speed: 380,
        },
      },
      active_skills: {
        debuffs: {
          fire: {
            value: false,
            timeout: null,
          },
        },
      },
      modes: {
        passive: {
          speed: 75,
          agressiveDistance: 400,
        },
        active: {
          speed: 300,
          agressiveDistance: 400,
        },
        returning: {
          speed: 75,
          agressiveDistance: 300,
        },
      },
    }
    this.abilities = {
      use_teleport: false,
      use_create_vampire_bullets: false,
      use_create_fire_bullets: false,
      boss_easy: {
        increaseRadius: () => {
          this.radius = 80
          this.damage += 20
          setTimeout(() => {
            this.radius = 50
            this.damage -= 20
          }, 5000)
        },
      },
      boss_normal: {
        teleportation: () => {
          this.abilities.use_teleport = true
        },
      },
      boss_hard: {
        createBullets: () => {
          this.abilities.use_create_vampire_bullets = true
        },
      },
      boss_legend: {
        increaseSpeed: () => {
          this.options.modes.active.speed += 45
          this.radius -= 25
          this.abilities.use_create_fire_bullets = true
          setTimeout(() => {
            this.options.modes.active.speed -= 45
            this.radius += 25
          }, 5000)
        },
      },
    }
    this.use_ability = true
    this.hp = this.options.types[type].hp
    this.damage = this.options.types[type].damage
    this.radius = this.options.types[type].radius
    this.options.modes.active.speed = this.options.types[type].speed
    this.rotate = rotate
    // active or passive behavior
    this.mode = 'passive'
    this.agressiveDistance = 0
    this.type = this.options.types[type]
    this.changingDirection = true
    this.bite = false
    this.cooldownBite()
  }

  update(dt) {
    super.update(dt)

    this.updateSpeed(dt)

    // Make sure the zombie stays in bounds
    this.x = Math.max(
      0 + Constants.PLAYER_RADIUS,
      Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.x)
    )
    this.y = Math.max(
      0 + Constants.PLAYER_RADIUS,
      Math.min(Constants.MAP_SIZE - Constants.PLAYER_RADIUS, this.y)
    )

    if (this.options.active_skills.debuffs.fire.value) {
      this.updateHp(-10 * dt * 5)
    }

    this.useActiveSkill()
  }

  updateSpeed(dt) {
    const max_speed = this.options.modes[this.mode].speed
    if (this.direction === null) {
      this.speed = Math.max(0, Math.min(max_speed, this.speed - dt * max_speed))
    } else {
      this.speed = Math.max(0, Math.min(max_speed, this.speed + dt * max_speed))
    }
  }

  checkLocationInZone() {
    if (['easy', 'boss_easy'].includes(this.type.name)) {
      return this.getZoneBounds(1, 0.75)
    } else if (['normal', 'boss_normal'].includes(this.type.name)) {
      return this.getZoneBounds(0.75, 0.5)
    } else if (['hard', 'boss_hard'].includes(this.type.name)) {
      return this.getZoneBounds(0.5, 0.25)
    } else if (['boss_legend'].includes(this.type.name)) {
      return this.getZoneBounds(0.25, 0)
    } else {
      return false
    }
  }

  useActiveSkill() {
    if (
      this.use_ability &&
      ['boss_easy', 'boss_normal', 'boss_hard', 'boss_legend'].includes(
        this.type.name
      ) &&
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
    this.agressiveDistance = this.options.modes[mode].agressiveDistance
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
      ...super.serializeForUpdate(),
      direction: this.direction,
      hp: this.hp,
      max_hp: this.type.hp,
      rotate: this.rotate,
      radius: this.radius,
      icon: `zombie_${this.type.name}.svg`,
    }
  }
}

module.exports = Zombie
