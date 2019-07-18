module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 200,
  PLAYER_FIRE_COOLDOWN: 0.1,

  BULLET_RADIUS: 3,

  // ZOMBIE_RADIUS: 20,
  ZOMBIE_EASY_MAX_AMOUNT: 1000,
  ZOMBIE_NORMAL_MAX_AMOUNT: 700,
  ZOMBIE_HARD_MAX_AMOUNT: 500,

  ZOMBIE_BOSS_RADIUS: 50,
  ZOMBIE_BOSS_EASY_MAX_AMOUNT: 3,

  SCORE_BULLET_HIT: 5,

  THING_AMOUNT: 1000,
  THING_RADIUS: 15,

  MAP_SIZE: 10000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    ROTATE: 'rotate',
    CLICK: 'click',
    LEVEL_UP: 'levelup',
    UPDATE_WEAPON: 'update_weapon',
    USE_ACTIVE_SKILL: 'active_skill',
    GAME_OVER: 'dead',
  },
});
