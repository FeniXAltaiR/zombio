import {updateWeapon, addNewSkill} from './networking.js'

const weapons = document.querySelector('.weapons')

const createBtn = (name, type) => {
  const btn = document.createElement('button')
  btn.innerHTML = name
  btn.onclick = e => {
    if (type === 'weapon') {
      updateWeapon(name)
    } else if (type === 'skill') {
      addNewSkill(name)
    }
    weapons.innerHTML = ''
  }
  weapons.appendChild(btn)
}

export const updateWeaponsBar = me => {
  if (weapons.innerHTML) return

  const {level} = me.experience
  const {first_skill, second_skill} = me.active_skills
  if (me.weapon === 'pistol' && level >= 2) {
    ['uzi', 'rifle', 'shotgun'].forEach(weapon => {
      createBtn(weapon, 'weapon')
    })
  } else if (['uzi', 'rifle', 'shotgun'].includes(me.weapon) && level >= 3) {
    ['machinegun', 'sniper_rifle', 'auto_shotgun'].forEach(weapon => {
      createBtn(weapon, 'weapon')
    })
  } else if (first_skill.value === null && level >= 4) {
    ['speedup', 'health'].forEach(skill => {
      createBtn(skill, 'skill')
    })
  } else if (second_skill.value === null && level >= 5) {
    const skills = ['speedup', 'health'].filter(skill => skill !== first_skill.value)
    skills.forEach(skill => {
      createBtn(skill, 'skill')
    })
  }
}

export const setWeaponsBar = hidden => {
  if (hidden) {
    weapons.classList.add('hidden');
  } else {
    weapons.classList.remove('hidden');
  }
}
