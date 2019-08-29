import {updateWeapon, addNewSkill} from './networking.js'

const weapons = document.querySelector('.weapons')

let timeout = false
const resetTimeout = () => {
  timeout = true
  setTimeout(() => {
    timeout = false
  }, 250)
}

const createBtnSkill = skill => {
  const btn = document.createElement('span')
  const img = document.createElement('img')
  img.src = `assets/active_skills_${skill}.svg`
  btn.onclick = e => {
    addNewSkill(skill)
    weapons.innerHTML = ''
    resetTimeout()
  }
  btn.classList.add('weapons__skill')
  btn.appendChild(img)
  weapons.appendChild(btn)
}

const createBtnWeapon = weapon => {
  const btn = document.createElement('span')
  const img = document.createElement('img')
  img.src = `assets/weapon_${weapon}.svg`
  btn.onclick = e => {
    updateWeapon(weapon)
    weapons.innerHTML = ''
    resetTimeout()
  }
  btn.classList.add('weapons__weapon')
  btn.appendChild(img)
  weapons.appendChild(btn)
}

export const updateWeaponsBar = me => {
  if (weapons.innerHTML || timeout) return

  const {level} = me.experience
  const {first_skill, second_skill} = me.active_skills
  if (me.weapon === 'pistol' && level >= 3) {
    ['uzi', 'rifle', 'shotgun'].forEach(weapon => {
      createBtnWeapon(weapon)
    })
  } else if (first_skill.value === null && level >= 5) {
    ['speed', 'hp', 'defense'].forEach(skill => {
      createBtnSkill(skill, 'skill')
    })
  } else if (['uzi', 'rifle', 'shotgun'].includes(me.weapon) && level >= 7) {
    ['machinegun', 'sniper_rifle', 'auto_shotgun'].forEach(weapon => {
      createBtnWeapon(weapon)
    })
  } else if (second_skill.value === null && level >= 12) {
    ['teleport', 'double_bullets', 'fire_bullets'].forEach(skill => {
      createBtnSkill(skill, 'skill')
    })
  } else {
    weapons.innerHTML = ''
  }
}

export const setWeaponsBar = hidden => {
  if (hidden) {
    weapons.classList.add('hidden');
    weapons.style.bottom = '-100px'
    weapons.innerHTML = ''
  } else {
    weapons.classList.remove('hidden');
    weapons.style.bottom = '10px'
  }
}
