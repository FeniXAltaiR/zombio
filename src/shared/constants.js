module.exports = Object.freeze({
  PLAYER_RADIUS: 28,
  PLAYER_MAX_HP: 200,
  PLAYER_SPEED: 200,

  THING_AMOUNT: 300,

  MAP_SIZE: 10000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    ROTATE: 'rotate',
    CLICK: 'click',
    LEVEL_UP: 'levelup',
    UPDATE_WEAPON: 'update_weapon',
    ADD_NEW_SKILL: 'new_skill',
    USE_ACTIVE_SKILL: 'active_skill',
    GAME_OVER: 'dead',
    SAVE_ID_PLAYER: 'save_id_player'
  },
});
