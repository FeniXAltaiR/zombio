// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection, changeRotate, createBullet } from './networking';

function getDirection(x, y) {
  return Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y)
}

function onMouseMoveInput(e) {
  const [x, y] = [e.clientX, e.clientY]
  const rotate = getDirection(x, y)
  changeRotate(rotate)
}

let creatingBullets = null
function onMouseDownInput(e) {
  createBullet()
  creatingBullets = setInterval(createBullet, 20)
}

function onMouseUpInput(e) {
  clearInterval(creatingBullets)
}

function onTouchInput(e) {
  const touch = e.touches[0];
  const dir = getDirection(touch.clientX, touch.clientY);
  updateDirection(dir)
}

let keys = []
const values_keys = {
  w: [0, 1],
  a: [-1, 0],
  s: [0, -1],
  d: [1, 0]
}

function onKeyDownInput (e) {
  if (!['w', 'a', 's', 'd', 'F5'].includes(e.key)) {
    e.preventDefault()
    return
  }

  const findKey = keys.find(key => key === e.key)
  if (!findKey) {
    keys.push(e.key)
  }

  setDirection()
}

function onKeyUpInput (e) {
  keys = keys.filter(key => key !== e.key)
  setDirection()
}

function setDirection () {
  let [x, y] = [0, 0]

  keys.forEach(key => {
    const [valueX, valueY] = values_keys[key]
    x += valueX
    y += valueY
  })

  const dir = Math.atan2(x, y)
  if (!keys.length) {
    updateDirection(null)
  } else {
    updateDirection(dir)
  }
}

function onWheelInput(e) {
  e.preventDefault()
}

export function startCapturingInput() {
  // Mouse events
  window.addEventListener('mousemove', onMouseMoveInput);
  window.addEventListener('mousedown', onMouseDownInput);
  window.addEventListener('mouseup', onMouseUpInput);
  window.addEventListener('wheel', onWheelInput);
  // Touch events
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
  // Keyboard events
  window.addEventListener('keydown', onKeyDownInput);
  window.addEventListener('keyup', onKeyUpInput);
}

export function stopCapturingInput() {
  window.removeEventListener('mousemove', onMouseMoveInput);
  window.removeEventListener('mousedown', onMouseDownInput);
  window.removeEventListener('mouseup', onMouseUpInput);
  window.removeEventListener('wheel', onWheelInput);
  // Touch events
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
    // Keyboard events
  window.removeEventListener('keydown', onKeyDownInput);
  window.removeEventListener('keyup', onKeyUpInput);
}
