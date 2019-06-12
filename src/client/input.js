// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection, changeRotate, createBullet } from './networking';

let keys = []
const values_keys = {
  w: [0, 1],
  a: [-1, 0],
  s: [0, -1],
  d: [1, 0]
}

function onMouseInput(e) {
  const [x, y] = [e.clientX, e.clientY]
  const rotate = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y)
  changeRotate(rotate)
}

function onClickInput(e) {
  e.preventDefault()
  createBullet()
}

function onDragStartInput(e) {
  console.log('dragstart')
}

function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
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

function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  updateDirection(dir);
}

export function startCapturingInput() {
  window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onClickInput);
  window.addEventListener('dragstart', onDragStartInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
  window.addEventListener('wheel', onWheelInput);
  window.addEventListener('keydown', onKeyDownInput);
  window.addEventListener('keyup', onKeyUpInput);
}

export function stopCapturingInput() {
  window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onClickInput);
  window.removeEventListener('dragstart', onDragStartInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
  window.removeEventListener('wheel', onWheelInput);
  window.removeEventListener('keydown', onKeyDownInput);
  window.removeEventListener('keyup', onKeyUpInput);
}
