module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 200,
  PLAYER_FIRE_COOLDOWN: 0.1,

  BULLET_RADIUS: 3,
  BULLET_SPEED: 800,
  BULLET_DAMAGE: 10,

  ZOMBIE_RADIUS: 20,
  ZOMBIE_MAX_HP: 50,
  ZOMBIE_SPEED: 100,
  ZOMBIE_DAMAGE: 20,

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 1,

  MAP_SIZE: 10000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    ROTATE: 'rotate',
    CLICK: 'click',
    GAME_OVER: 'dead',
  },
});
