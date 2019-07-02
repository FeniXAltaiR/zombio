// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import { getAsset } from './assets';
import { getCurrentState } from './state';
import { setPassiveSkillsBar } from './passive-skills'

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, BULLET_RADIUS, MAP_SIZE, ZOMBIE_RADIUS, THING_RADIUS } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d', {alpha: false});
setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));

function render() {
  const { me, others, bullets, zombies, things } = getCurrentState();
  if (!me) {
    return;
  }

  // Draw background
  renderBackground(me.x, me.y);

  // Draw boundaries
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_SIZE, MAP_SIZE);

  // Draw all bullets
  bullets.forEach(renderBullet.bind(null, me));

  // Draw all players
  renderPlayer(me, me);
  others.forEach(renderPlayer.bind(null, me));

  // Draw all zombies
  zombies.forEach(renderZombie.bind(null, me))

  // Draw all things
  things.forEach(renderThing.bind(null, me))
}

function renderBackground(x, y) {
  context.fillStyle = 'grey'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'green';
  context.fillRect(canvas.width / 2 - x, canvas.height / 2 - y, MAP_SIZE, MAP_SIZE);
  context.fillStyle = '#DDB221';
  context.fillRect(canvas.width / 2 - x, canvas.height / 2 - y, MAP_SIZE * 0.75, MAP_SIZE * 0.75);
  context.fillStyle = '#9147B7';
  context.fillRect(canvas.width / 2 - x, canvas.height / 2 - y, MAP_SIZE * 0.5, MAP_SIZE * 0.5);
  context.fillStyle = '#9A4430';
  context.fillRect(canvas.width / 2 - x, canvas.height / 2 - y, MAP_SIZE * 0.25, MAP_SIZE * 0.25);
  context.strokeStyle = 'rgba(0, 0, 0, .2)'
  for (let i = 0; i < MAP_SIZE; i += 50) {
    for (let k = 0; k < MAP_SIZE; k += 50) {
      if (
        x - i < (canvas.width / 2 + 100) &&
        x - i > -(canvas.width / 2 + 100) &&
        y - k < (canvas.height / 2 + 100) &&
        y - k > -(canvas.height / 2 + 100)
      ) {
        context.strokeRect(canvas.width / 2 - x + i, canvas.height / 2 - y + k, 50, 50)
      }
    }
  }
}

// Renders a ship at the given coordinates
function renderPlayer(me, player) {
  const { x, y, direction, rotate } = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(rotate)
  context.drawImage(
    getAsset('ship.svg'),
    -PLAYER_RADIUS,
    -PLAYER_RADIUS,
    PLAYER_RADIUS * 2,
    PLAYER_RADIUS * 2,
  );
  context.restore();

  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(
    canvasX - PLAYER_RADIUS,
    canvasY + PLAYER_RADIUS + 8,
    PLAYER_RADIUS * 2,
    2,
  );
  context.fillStyle = 'red';

  context.fillRect(
    canvasX - PLAYER_RADIUS + PLAYER_RADIUS * 2 * player.hp / (player.passive_skills.hp * player.parameters.hp),
    canvasY + PLAYER_RADIUS + 8,
    PLAYER_RADIUS * 2 * (1 - player.hp / (player.passive_skills.hp * player.parameters.hp)),
    2,
  );
}

function renderBullet(me, bullet) {
  const { x, y, radius } = bullet;
  context.drawImage(
    getAsset('bullet.svg'),
    canvas.width / 2 + x - me.x - radius,
    canvas.height / 2 + y - me.y - radius,
    radius * 2,
    radius * 2,
  );
}

function renderZombie(me, zombie) {
  const {x, y, direction, hp, max_hp, rotate} = zombie
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;
  const icon = zombie.icon.replace('NaN', '')

  context.save()
  context.translate(canvasX, canvasY);
  context.rotate(rotate)
  context.drawImage(
    getAsset(icon),
    -ZOMBIE_RADIUS,
    -ZOMBIE_RADIUS,
    ZOMBIE_RADIUS * 2,
    ZOMBIE_RADIUS * 2,
  )
  context.restore()

  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(
    canvasX - ZOMBIE_RADIUS,
    canvasY + ZOMBIE_RADIUS + 8,
    ZOMBIE_RADIUS * 2,
    2,
  );
  context.fillStyle = 'red';
  context.fillRect(
    canvasX - ZOMBIE_RADIUS + ZOMBIE_RADIUS * 2 * zombie.hp / zombie.max_hp,
    canvasY + ZOMBIE_RADIUS + 8,
    ZOMBIE_RADIUS * 2 * (1 - zombie.hp / zombie.max_hp),
    2,
  );
}

function renderThing(me, thing) {
  const {x, y} = thing
  const canvasX = canvas.width / 2 + x - me.x
  const canvasY = canvas.height / 2 + y - me.y

  context.save()
  context.translate(canvasX, canvasY)
  context.drawImage(
    getAsset('medkit.svg'),
    -THING_RADIUS,
    -THING_RADIUS,
    THING_RADIUS * 2,
    THING_RADIUS * 2,
  )
  context.restore()
}

function renderMainMenu() {
  const t = Date.now() / 7500;
  const x = MAP_SIZE / 2 + 800 * Math.cos(t);
  const y = MAP_SIZE / 2 + 800 * Math.sin(t);
  renderBackground(x, y);
}

let renderInterval = setInterval(renderMainMenu, 1000 / 60);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(render, 1000 / 60);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(renderMainMenu, 1000 / 60);
}
