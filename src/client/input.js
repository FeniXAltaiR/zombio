// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection, changeRotate, createBullet, levelUp, useActiveSkill } from './networking';

function getDirection(x, y) {
  return Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y)
}

function onMouseMoveInput(e) {
  const [x, y] = [e.clientX, e.clientY]
  const rotate = getDirection(x, y)
  changeRotate(rotate)
}

let creatingBullets = null
setInterval(() => {
  if (creatingBullets) {
    createBullet()
  }
}, 20)

function onMouseDownInput(e) {
  createBullet()
  creatingBullets = true
}

function onMouseUpInput(e) {
  creatingBullets = false
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

function onKeyDownInput(e) {
  if (e.keyCode === 116) {
    return
  }

  if ([69, 81, 82].includes(e.keyCode)) {
    useActiveSkill(e.keyCode)
  }

  if ([49, 50, 51, 52, 53, 54, 55, 56].includes(e.keyCode)) {
    levelUp(e.keyCode)
    return
  }

  // A, D, S, W
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

let timeoutOnKeyUpInput = null
let keysToRemove = []
function onKeyUpInput(e) {
  clearTimeout(timeoutOnKeyUpInput)
    if ([65, 68].includes(e.keyCode)) {
      keysToRemove = keysToRemove.filter(key => ![65, 68].includes(e.keyCode))
      keysToRemove.push(e.keyCode)
    } else if ([83, 87].includes(e.keyCode)) {
      keysToRemove = keysToRemove.filter(key => ![83, 87].includes(e.keyCode))
      keysToRemove.push(e.keyCode)
    }
    keys = keys.filter(key => !keysToRemove.includes(key))
  
  timeoutOnKeyUpInput = setTimeout(() => {
    setDirection()
  }, 20)
}

let oldDir = null
function setDirection() {
  let [x, y] = [0, 0]

  keys.forEach(key => {
    const [valueX, valueY] = values_keys[key]
    oldDir = [valueX, valueY]
    x += valueX
    y += valueY
  })

  if (!keys.length) {
    const [valueX, valueY] = oldDir
    x += valueX
    y += valueY
    updateDirection(null)
  } else {
    const dir = Math.atan2(x, y)
    updateDirection(dir)
  }
}

function onWheelInput(e) {
  e.preventDefault()
}

function onMouseContextInput(e) {
  e.preventDefault()
}

const canvas = document.getElementById('game-canvas');

export function startCapturingInput() {
  // Mouse events
  canvas.addEventListener('mousemove', onMouseMoveInput);
  canvas.addEventListener('mousedown', onMouseDownInput);
  canvas.addEventListener('contextmenu', onMouseContextInput);
  canvas.addEventListener('mouseup', onMouseUpInput);
  canvas.addEventListener('wheel', onWheelInput);
  // Touch events
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
  // Keyboard events
  window.addEventListener('keydown', onKeyDownInput);
  window.addEventListener('keyup', onKeyUpInput);
}

export function stopCapturingInput() {
  // Mouse events
  canvas.removeEventListener('mousemove', onMouseMoveInput);
  canvas.removeEventListener('mousedown', onMouseDownInput);
  canvas.removeEventListener('contextmenu', onMouseContextInput);
  canvas.removeEventListener('mouseup', onMouseUpInput);
  canvas.removeEventListener('wheel', onWheelInput);
  // Touch events
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
  // Keyboard events
  window.removeEventListener('keydown', onKeyDownInput);
  window.removeEventListener('keyup', onKeyUpInput);

  onMouseUpInput()
}

export function clearKeys() {
  keys = []
}
