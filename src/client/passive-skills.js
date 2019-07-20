const passive = document.querySelector('.passive-skills')

export const updatePassiveSkillsBar = me => {
  const {level, skill_points} = me.experience
  if (level - skill_points <= 0) {
    setPassiveSkillsBar(true)
    return
  } else {
    setPassiveSkillsBar(false)
  }
  const skills = document.querySelectorAll('.passive-skills__skill')

  skills.forEach(skill => {
    const name = skill.dataset.name
    const spans = skill.querySelectorAll('span')

    spans.forEach((span, index) => {
      if (me.used_skill_points[name].value > index) {
        const color = me.used_skill_points[name].color
        span.className = `passive-skills__skill--${color}`
      } else {
        span.className = `passive-skills__skill--gray`
      }
    })
  })
}

export const setPassiveSkillsBar = hidden => {
  if (hidden) {
    passive.classList.add('hidden');
    passive.style.bottom = '-100px'
  } else {
    passive.classList.remove('hidden');
    passive.style.bottom = '10px'
  }
}