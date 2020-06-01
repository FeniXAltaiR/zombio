import {connect, play} from './networking'
import {startRendering, stopRendering} from './render'
import {startCapturingInput, stopCapturingInput, clearKeys} from './input'
import {downloadAssets} from './assets'
import {initState} from './state'
import {setLeaderboardHidden} from './leaderboard'
import {setExperienceHidden} from './experience'
import {setEffectsHidden} from './effects'
import {setHealthBarHidden} from './health-bar'
import {setNotifyHidden} from './notify'
import {setPassiveSkillsBar} from './passive-skills'
import {setActiveSkillsHidden} from './active-skills'
import {setWeaponsBar} from './weapons'

import './css/main.css'

const playMenu = document.querySelector('.play-menu')
const playButton = document.getElementById('play-button')
const usernameInput = document.getElementById('username-input')

// contact
const contact = document.querySelector('.contact')
const contact_modal = document.querySelector('.contact__modal')
const contact_btn = document.querySelector('.contact__btn')
const contact_span = document.querySelector('.contact > span')

contact_span.onclick = (e) => {
  contact_modal.classList.remove('hidden')
}

contact_btn.onclick = (e) => {
  e.stopPropagation()
  contact_modal.classList.add('hidden')
}

const getSkinValue = () => {
  return Math.ceil(Math.random() * 8)
}

const showStatistic = (statistic) => {
  const stat = document.querySelector('.play-menu__statistic')
  stat.innerHTML = ''
  const stats = {
    amount_bullets: 'number of bullets',
    amount_things: 'raised things',
    amount_zombies: 'killed monsters',
    amount_recovery_hp: 'restore health',
  }
  Object.keys(statistic).forEach((option) => {
    const p = document.createElement('p')
    p.innerHTML = `${stats[option]}: ${Math.round(statistic[option])}`
    stat.appendChild(p)
  })
}

const getIdPlayer = () => {
  const id_player = localStorage.getItem('id_player')
  if (id_player) {
    return id_player
  }
  return null
}

const startGame = () => {
  // Play!
  play({
    username: usernameInput.value,
    icon: getSkinValue(),
    last_id_player: getIdPlayer(),
  })
  playMenu.classList.add('hidden')
  initState()
  startCapturingInput()
  startRendering()
  setLeaderboardHidden(false)
  setExperienceHidden(false)
  setEffectsHidden(false)
  setHealthBarHidden(false)
  setNotifyHidden(false)
  setPassiveSkillsBar(false)
  setActiveSkillsHidden(false)
  setWeaponsBar(false)
  contact.classList.add('hidden')
}

const onGameOver = statistic => {
  clearKeys()
  stopCapturingInput()
  stopRendering()
  playMenu.classList.remove('hidden')
  setLeaderboardHidden(true)
  setExperienceHidden(true)
  setEffectsHidden(true)
  setHealthBarHidden(true)
  setNotifyHidden(true)
  setPassiveSkillsBar(true)
  setActiveSkillsHidden(true)
  setWeaponsBar(true)
  showStatistic(statistic)
  contact.classList.remove('hidden')
}

Promise.all([connect(onGameOver), downloadAssets()])
  .then(() => {
    playMenu.classList.remove('hidden')
    usernameInput.focus()
    usernameInput.onkeydown = (e) => {
      if (e.keyCode === 13) {
        startGame()
      }
    }

    playButton.onclick = () => {
      startGame()
    }
  })
  .catch(console.error)