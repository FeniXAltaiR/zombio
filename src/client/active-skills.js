const activeSkills = document.querySelector('.active-skills')
const skills = activeSkills.querySelectorAll('.active-skills__skill')

const getCooldown = skill => {
  if (skill.cooldown) {
    return true
  }
  return false
}

export const updateActiveSkills = me => {
  const {first_skill, second_skill, ultra_skill} = me.active_skills

  skills.forEach(nodeSkill => {
    const skill_name = nodeSkill.dataset.name
    const p = nodeSkill.querySelector('p')
    p.innerHTML = me.active_skills[skill_name].keyCode
    const img = nodeSkill.querySelector('img')
    if (me.active_skills[skill_name].value) {
      img.src = `assets/active_skills_${me.active_skills[skill_name].value}.svg`
    }
    // if (!img && me.active_skills[skill_name].value) {
    //   const skillImg = document.createElement('img')
    //   skillImg.src = `assets/active_skills_${me.active_skills[skill_name].value}.svg`
    //   nodeSkill.appendChild(skillImg)
    // }

    const cooldown = getCooldown(me.active_skills[skill_name])

    if (me.active_skills[skill_name].value === null) {
      // nodeSkill.classList.add('hidden')
      nodeSkill.style.bottom = '-100px'
    } else {
      // nodeSkill.classList.remove('hidden')
      nodeSkill.style.bottom = '10px'
    }

    if (cooldown) {
      nodeSkill.classList.add('active-skills__cooldown')
    } else {
      nodeSkill.classList.remove('active-skills__cooldown')
    }
  })
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