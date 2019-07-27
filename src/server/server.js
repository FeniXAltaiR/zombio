const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const shortid = require('shortid');
const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static('public'));

// Server channels
let id_channel = null
app.get('/', (req, res, next) => {
  const id = req.query.server
  const servers = Object.keys(games)
  let exist_id_channel = null

  function getOnlinePlayers(game) {
    return games[game].getOnlinePlayers() < 3
  }

  if (servers.length) {
    exist_id_channel = servers.find(game => getOnlinePlayers(game))
  }

  if (id) {
    const findServer = servers.find(game => game === id)
    if (findServer) {
      exist_id_channel = findServer
    }
  }

  if (exist_id_channel) {
    id_channel = exist_id_channel
  } else {
    id_channel = shortid()
    games[id_channel] = new Game(id_channel)
  }

  // console.log('id_channel', id_channel)
  next()
})

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on(Constants.MSG_TYPES.ROTATE, rotateInput);
  socket.on(Constants.MSG_TYPES.CLICK, createBullet);
  socket.on(Constants.MSG_TYPES.LEVEL_UP, levelUp);
  socket.on(Constants.MSG_TYPES.UPDATE_WEAPON, updateWeapon);
  socket.on(Constants.MSG_TYPES.ADD_NEW_SKILL, addNewSkill);
  socket.on(Constants.MSG_TYPES.USE_ACTIVE_SKILL, useActiveSkill);
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
const games = {}

for (let i = 0; i < 3; i++) {
  const id = shortid()
  games[id] = new Game(id)
}

function joinGame(options) {
  games[id_channel].addPlayer(this, options);
}

function handleInput(dir) {
  games[id_channel].handleInput(this, dir);
}

function onDisconnect() {
  games[id_channel].removePlayer(this);
}

function rotateInput(rotate) {
  games[id_channel].changeRotate(this, rotate)
}

function createBullet() {
  games[id_channel].createBullet(this)
}

function levelUp(code) {
  games[id_channel].levelUp(this, code)
}

function updateWeapon(weapon) {
  games[id_channel].updateWeapon(this, weapon)
}

function addNewSkill(skill) {
  games[id_channel].addNewSkill(this, skill)
}

function useActiveSkill(skill) {
  games[id_channel].useActiveSkill(this, skill)
}
