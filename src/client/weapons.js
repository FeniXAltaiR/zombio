import {updateWeapon} from './networking.js'

const weapons = document.querySelector('.weapons')

export const updateWeaponsBar = me => {
  if (weapons.innerHTML) return
  
  if (me.weapon === 'pistol') {
    ['uzi', 'rifle', 'shotgun'].forEach(weapon => {
      const btn = document.createElement('button')
      btn.innerHTML = weapon
      btn.onclick = e => {
        e.stopPropagation()
        updateWeapon(weapon)
        weapons.innerHTML = ''
      }
      weapons.appendChild(btn)
    })
  } else if (['uzi', 'rifle', 'shotgun'].includes(me.weapon)) {
    ['machinegun', 'sniper_rifle', 'auto_shotgun'].forEach(weapon => {
      const btn = document.createElement('button')
      btn.innerHTML = weapon
      btn.onclick = e => {
        e.stopPropagation()
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
    // weapons.style.bottom = '-100px'
  } else {
    weapons.classList.remove('hidden');
    // weapons.style.bottom = '10px'
  }
}
