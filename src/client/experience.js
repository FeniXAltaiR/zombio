const experience = document.querySelector('.experience')
const current = document.querySelector('.experience__current')
const paragraph = document.querySelector('.experience p')

export const updateExpBar = me => {
  const {currentScore, nextLevel} = me.experience
  current.style['background-image'] = `linear-gradient(
    to right,
    #2D8555 0%,
    #2D8555 ${currentScore * 100/nextLevel}%,
    #AD1C20 ${currentScore * 100/nextLevel}%,
    #AD1C20
  )`
  paragraph.innerHTML = `${currentScore}/${nextLevel}`
}

export const setExperienceHidden = hidden => {
  if (hidden) {
    experience.classList.add('hidden');
    experience.style.bottom = '-100px'
  } else {
    experience.classList.remove('hidden');
    experience.style.bottom = '10px'
  }
}