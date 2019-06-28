// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection, changeRotate, createBullet, levelUp } from './networking';

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
  87: [0, 1],
  65: [-1, 0],
  83: [0, -1],
  68: [1, 0]
}

function onKeyDownInput (e) {
  if (e.keyCode === 116) {
    return
  }

  if ([49, 50, 51, 52, 53, 54, 55, 56].includes(e.keyCode)) {
    levelUp(e.keyCode)
    return
  }

  if (![65, 68, 83, 87].includes(e.keyCode)) {
    e.preventDefault()
    return
  }

  const findKey = keys.find(key => key === e.keyCode)
  if (!findKey) {
    keys.push(e.keyCode)
  }

  setDirection()
}

function onKeyUpInput (e) {
  keys = keys.filter(key => key !== e.keyCode)
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
  // Mouse events
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

  onMouseUpInput()
}
