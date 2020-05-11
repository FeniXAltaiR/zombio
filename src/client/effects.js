const effectsBar = document.querySelector('.effects')
const buffs = effectsBar.querySelector('.effects__buffs')
const debuffs = effectsBar.querySelector('.effects__debuffs')

export const updateEffectsBar = (me) => {
  const {effects} = me
  const list_buffs = Object.keys(effects).filter(
    (effect) => effects[effect] > 0
  )
  const list_debuffs = Object.keys(effects).filter(
    (effect) => effects[effect] < 0
  )

  buffs.querySelectorAll('img').forEach((img) => {
    const name = img.dataset.name
    if (list_buffs.includes(name)) {
      img.classList.remove('hidden')
    } else {
      img.classList.add('hidden')
    }
  })

  debuffs.querySelectorAll('img').forEach((img) => {
    const name = img.dataset.name
    if (list_debuffs.includes(name)) {
      img.classList.remove('hidden')
    } else {
      img.classList.add('hidden')
    }
  })
}

export const setEffectsHidden = (hidden) => {
  if (hidden) {
    // effectsBar.classList.add('hidden');
    effectsBar.style.top = '-150px'
  } else {
    // effectsBar.classList.remove('hidden');
    effectsBar.style.top = '10px'
  }
}
