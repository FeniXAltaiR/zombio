const activeSkills = document.querySelector('.active-skills')

const getCooldown = skill => {
  if (skill.cooldown) {
    return 'active-skills__cooldown'
  }
  return null
}

export const updateActiveSkills = me => {
  const {first_skill, second_skill, ultra_skill} = me.active_skills
  activeSkills.innerHTML = [first_skill, second_skill, ultra_skill].reduce((str, skill) => {
    let cooldown = getCooldown(skill)

    return str + `
      <span class="${cooldown} active-skills__skill">
        <p>${skill.keyCode}</p>
        <img src="assets/passive_skills_hp.svg" alt="">
      </span>
    `
  }, '')
}

export const setActiveSkillsHidden = hidden => {
  if (hidden) {
    activeSkills.classList.add('hidden');
    activeSkills.style.bottom = '-100px'
  } else {
    activeSkills.classList.remove('hidden');
    activeSkills.style.bottom = '10px'
  }
}