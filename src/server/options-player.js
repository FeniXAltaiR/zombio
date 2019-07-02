const options = {
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
      damage: 5,
      distance: 600,
      noise: 0.3
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

module.exports = options
