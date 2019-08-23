const effectsBar = document.querySelector('.effects')
const buffs = effectsBar.querySelector('.effects__buffs')
const debuffs = effectsBar.querySelector('.effects__debuffs')

export const updateEffectsBar = me => {
  const {effects} = me
  const list_buffs = Object.keys(effects).filter(effect => effects[effect] > 0)
  const list_debuffs = Object.keys(effects).filter(effect => effects[effect] < 0)

  let buffs_str = ''
  list_buffs.forEach(buff => {
    buffs_str += `<img src="assets/passive_skills_${buff}.svg" alt="">`
  })

  let debuffs_str = ''
  list_debuffs.forEach(debuff => {
    debuffs_str += `<img src="assets/passive_skills_${debuff}.svg" alt="">`
  })

  buffs.innerHTML = buffs_str
  debuffs.innerHTML = debuffs_str
}

export const setEffectsHidden = hidden => {
  if (hidden) {
    effectsBar.classList.add('hidden');
    effectsBar.style.top = '-100px'
  } else {
    effectsBar.classList.remove('hidden');
    effectsBar.style.top = '10px'
  }
}