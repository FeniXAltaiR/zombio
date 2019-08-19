const experience = document.querySelector('.experience')
const current = document.querySelector('.experience__current')
const paragraph = document.querySelector('.experience p')

export const updateExpBar = me => {
  const {currentScore, nextLevel} = me.experience
  const gradient = 'linear-gradient(180deg, #8A2886 0%, #BC77BF 43.75%, #481455 100%)'
  current.style['background-image'] = `linear-gradient(
    to right,
    #8A2886 0%,
    #8A2886 ${currentScore * 100/nextLevel}%,
    #F8F8F8 ${currentScore * 100/nextLevel}%,
    #F8F8F8
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