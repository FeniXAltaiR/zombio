// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection } from './networking';

let keys = []
const values_keys = {
  w: [0, 1],
  a: [-1, 0],
  s: [0, -1],
  d: [1, 0]
}

function onMouseInput(e) {
  handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
}

function onKeyDownInput (e) {
  const findKey = keys.find(key => key === e.key)
  if (!findKey) {
    keys.push(e.key)
  }
  getDirection()
}

function onKeyUpInput (e) {
  keys = keys.filter(key => key !== e.key)
  getDirection()
}

function getDirection () {
  let [x, y] = [0, 0]

  keys.forEach(key => {
    const [valueX, valueY] = values_keys[key]
    x += valueX
    y += valueY
  })

  const dir = Math.atan2(x, y)
  updateDirection(dir)
}

function onWheelInput(e) {
  e.preventDefault()
}

function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  updateDirection(dir);
}

export function startCapturingInput() {
  // window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onMouseInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
  window.addEventListener('wheel', onWheelInput);
  window.addEventListener('keydown', onKeyDownInput);
  window.addEventListener('keyup', onKeyUpInput);
}

export function stopCapturingInput() {
  // window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onMouseInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
  window.removeEventListener('wheel', onWheelInput);
  window.removeEventListener('keydown', onKeyDownInput);
  window.removeEventListener('keyup', onKeyUpInput);
}
