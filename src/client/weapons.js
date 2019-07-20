import {updateWeapon} from './networking.js'

const weapons = document.querySelector('.weapons')

export const updateWeaponsBar = me => {
  if (weapons.innerHTML) return

  const {level} = me.experience
  if (me.weapon === 'pistol' && level >= 2) {
    ['uzi', 'rifle', 'shotgun'].forEach(weapon => {
      const btn = document.createElement('button')
      btn.innerHTML = weapon
      btn.onclick = e => {
        updateWeapon(weapon)
        weapons.innerHTML = ''
      }
      weapons.appendChild(btn)
    })
  } else if (['uzi', 'rifle', 'shotgun'].includes(me.weapon) && level >= 3) {
    ['machinegun', 'sniper_rifle', 'auto_shotgun'].forEach(weapon => {
      const btn = document.createElement('button')
      btn.innerHTML = weapon
      btn.onclick = e => {
        updateWeapon(weapon)
        weapons.innerHTML = ''
      }
      weapons.appendChild(btn)
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
