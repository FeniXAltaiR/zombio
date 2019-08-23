const healthBar = document.querySelector('.health-bar')
const span = healthBar.querySelector('span')
const Constants = require('../shared/constants');

export const updateHealthBar = me => {
  const {hp} = me
  const max_hp = me.parameters.hp * me.passive_skills.hp
  const percent = hp * 100 / max_hp
  healthBar.style['background-image'] = `linear-gradient(
    0deg,
    #AA0300 0%,
    #DB1B04 ${percent}%,
    white ${percent}%,
    white
  )`
  span.innerHTML = Math.round(hp)
  if (percent > 60) {
    healthBar.style.color = 'white'
  } else {
    healthBar.style.color = 'black'
  }
}

export const setHealthBarHidden = hidden => {
  if (hidden) {
    // healthBar.classList.add('hidden');
    healthBar.style.left = '-100px'
  } else {
    // healthBar.classList.remove('hidden');
    healthBar.style.left = '10px'
  }
}