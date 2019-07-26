// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, BULLET_RADIUS, MAP_SIZE, THING_RADIUS } = Constants;

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

  // Draw all things
  things.forEach(renderThing.bind(null, me))

  // Draw all zombies
  zombies.forEach(renderZombie.bind(null, me))
}

function renderBackground(x, y) {
  context.fillStyle = 'grey'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(
    getAsset('map.svg'),
    canvas.width / 2 - x,
    canvas.height / 2 - y,
    MAP_SIZE,
    MAP_SIZE
  )

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
  const { x, y, direction, rotate, icon } = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  // Draw player
  context.save();
  // context.shadowColor = 'red';
  // context.shadowBlur = 15;
  context.translate(canvasX, canvasY);
  context.rotate(rotate)
  context.drawImage(
    getAsset(icon),
    -PLAYER_RADIUS,
    -PLAYER_RADIUS,
    PLAYER_RADIUS * 2,
    PLAYER_RADIUS * 2,
  );
  context.restore();

  // Test effect
  // context.fillStyle = 'rgba(255, 255, 255, 0.1)';
  // context.fillRect(0, 0, canvas.width, canvas.height);
  // context.beginPath();
  // context.arc(canvas.width / 2, canvas.height / 2, PLAYER_RADIUS, 0, Math.PI * 2, true);
  // context.closePath();
  // context.fillStyle = 'blue';
  // context.fill();

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
  const {use_fire_bullets} = me.active_skills

  context.save()
  // context.filter = 'invert(50%)'
  // context.filter = 'sepia(60%)'
    if (bullet.effect === 'fire') {
      context.shadowColor = 'orange'
    } else if (bullet.effect === 'vampire') {
      context.shadowColor = 'red'
    } else {
      context.shadowColor = 'transparent'
    }
  // context.shadowBlur = 35;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 5;
  context.drawImage(
    getAsset('bullet.svg'),
    canvas.width / 2 + x - me.x - radius,
    canvas.height / 2 + y - me.y - radius,
    radius * 2,
    radius * 2,
  );
  context.restore()
}

function renderZombie(me, zombie) {
  const {x, y, direction, hp, max_hp, rotate, icon} = zombie
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  context.save()
  context.translate(canvasX, canvasY);
  context.rotate(rotate)
  context.drawImage(
    getAsset(icon),
    -zombie.radius,
    -zombie.radius,
    zombie.radius * 2,
    zombie.radius * 2,
  )
  context.restore()

  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(
    canvasX - zombie.radius,
    canvasY + zombie.radius + 8,
    zombie.radius * 2,
    2,
  );
  context.fillStyle = 'red';
  context.fillRect(
    canvasX - zombie.radius + zombie.radius * 2 * zombie.hp / zombie.max_hp,
    canvasY + zombie.radius + 8,
    zombie.radius * 2 * (1 - zombie.hp / zombie.max_hp),
    2,
  );
}

function renderThing(me, thing) {
  const {x, y, icon} = thing
  const canvasX = canvas.width / 2 + x - me.x
  const canvasY = canvas.height / 2 + y - me.y

  context.save()
  context.translate(canvasX, canvasY)
  context.drawImage(
    getAsset(icon),
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
  // renderBackground(x, y);
}

let renderInterval = stopRendering()

// Replaces main menu rendering with game rendering.
export function startRendering() {
  window.cancelAnimationFrame(renderInterval)
  renderInterval = window.requestAnimationFrame(startRendering)
  render()
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  window.cancelAnimationFrame(renderInterval)
  renderInterval = window.requestAnimationFrame(stopRendering)
  renderMainMenu()
}
