module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 200,
  PLAYER_FIRE_COOLDOWN: 0.1,

  BULLET_RADIUS: 3,

  ZOMBIE_RADIUS: 20,
  ZOMBIE_EASY_MAX_AMOUNT: 500,
  ZOMBIE_NORMAL_MAX_AMOUNT: 300,
  ZOMBIE_HARD_MAX_AMOUNT: 200,

  SCORE_BULLET_HIT: 5,

  THING_AMOUNT: 100,
  THING_RADIUS: 15,

  MAP_SIZE: 10000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    ROTATE: 'rotate',
    CLICK: 'click',
    LEVEL_UP: 'levelup',
    GAME_OVER: 'dead',
  },
});
