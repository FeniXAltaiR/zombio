const experience = document.querySelector('.experience')
const current = experience.querySelector('.experience__current')
const paragraph = experience.querySelector('.p')
const expScore = experience.querySelector('.experience__score')

export const updateExpBar = (me) => {
  const {currentScore, nextLevel, level} = me.experience
  const gradient =
    'linear-gradient(180deg, #8A2886 0%, #BC77BF 43.75%, #481455 100%)'
  current.style['background-image'] = `linear-gradient(
    to right,
    #8A2886 0%,
    #8A2886 ${(currentScore * 100) / nextLevel}%,
    #D0CACB ${(currentScore * 100) / nextLevel}%,
    #F8F8F8
  )`

  expScore.innerHTML = `
    <span>${currentScore}</span>
    <span>${level} lvl</span>
    <span>${nextLevel}</span>
  `
}

export const setExperienceHidden = (hidden) => {
  if (hidden) {
    // experience.classList.add('hidden');
    experience.style.bottom = '-100px'
  } else {
    // experience.classList.remove('hidden');
    experience.style.bottom = '10px'
  }
}
