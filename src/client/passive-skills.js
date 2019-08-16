import { getAsset } from './assets';
import { levelUp } from './networking.js'

const passive = document.querySelector('.passive-skills')
const skills = document.querySelectorAll('.passive-skills__skill')

const setBtnEvents = () => {
  skills.forEach(skill => {
    const name = skill.dataset.name
    const btn = skill.querySelector('img')
    btn.onclick = e => {
      e.stopPropagation()
      levelUp(name)
    }
  })
}

setBtnEvents()

export const updatePassiveSkillsBar = me => {
  skills.forEach(skill => {
    const name = skill.dataset.name
    const span = skill.querySelector('span')
    const currentValue = me.used_skill_points[name].value

    span.innerHTML = `${currentValue}/7`
  })
  
  const {level, skill_points} = me.experience
  if (level - skill_points <= 0) {
    setPassiveSkillsBar(true)
  } else {
    setPassiveSkillsBar(false)
  }
}

export const setPassiveSkillsBar = hidden => {
  if (hidden) {
    // passive.classList.add('hidden');
    passive.style.right = '-160px'
  } else {
    // passive.classList.remove('hidden');
    passive.style.right = '10px'
  }
}