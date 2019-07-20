// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#4-client-networking
import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { processGameUpdate } from './state';

const Constants = require('../shared/constants');

const socket = io(`ws://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      document.getElementById('disconnect-modal').classList.remove('hidden');
      document.getElementById('reconnect-button').onclick = () => {
        window.location.reload();
      };
    });
  })
);

export const play = options => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME, options);
};

export const updateDirection = throttle(20, dir => {
  socket.emit(Constants.MSG_TYPES.INPUT, dir);
});

export const changeRotate = throttle(20, rotate => {
  socket.emit(Constants.MSG_TYPES.ROTATE, rotate)
})

export const createBullet = () => {
  socket.emit(Constants.MSG_TYPES.CLICK)
}

export const levelUp = code => {
  socket.emit(Constants.MSG_TYPES.LEVEL_UP, code)
}

export const updateWeapon = weapon => {
  socket.emit(Constants.MSG_TYPES.UPDATE_WEAPON, weapon)
}

export const addNewSkill = skill => {
  socket.emit(Constants.MSG_TYPES.ADD_NEW_SKILL, skill)
}

export const useActiveSkill = skill => {
  socket.emit(Constants.MSG_TYPES.USE_ACTIVE_SKILL, skill)
}
