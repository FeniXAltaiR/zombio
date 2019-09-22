import { connect, play } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput, clearKeys } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';
import { setExperienceHidden } from './experience';
import { setEffectsHidden } from './effects';
import { setHealthBarHidden } from './health-bar';
import { setNotifyHidden } from './notify';
import { setPassiveSkillsBar } from './passive-skills'
import { setActiveSkillsHidden } from './active-skills'
import { setWeaponsBar } from './weapons'

// I'm using Bootstrap here for convenience, but I wouldn't recommend actually doing this for a real
// site. It's heavy and will slow down your site - either only use a subset of Bootstrap, or just
// write your own CSS.
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/main.css';

// const playMenu = document.getElementById('play-menu');
const playMenu = document.querySelector('.play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');
const skins = document.querySelector('button[data-name=skins]')
const chooseSkin = document.querySelector('.skins')
// const agreeSkinBtn = document.querySelector('.skins__btn')
const guide = document.querySelector('.guide')

// contact
const contact = document.querySelector('.contact')
const contact_modal = document.querySelector('.contact__modal')
const contact_btn = document.querySelector('.contact__btn')
const contact_span = document.querySelector('.contact > span')

contact_span.onclick = e => {
  contact_modal.classList.remove('hidden')
}

contact_btn.onclick = e => {
  e.stopPropagation()
  contact_modal.classList.add('hidden')
}

// skins

document.querySelectorAll('.skins__radio span').forEach(span => {
  span.onclick = e => {
    e.stopPropagation()
    document.querySelectorAll('.skins__radio span').forEach(item => {
      item.classList.remove('skins__radio--active')
    })
    span.classList.add('skins__radio--active')
  }
})

const getSkinValue = () => {
  const radios = document.querySelectorAll('.skins__radio span')
  let value
  radios.forEach(radio => {
    if (radio.classList.contains('skins__radio--active')) {
      value = radio.dataset.icon
    }
  })
  return value
}

const showStatistic = statistic => {
  const stat = document.querySelector('.play-menu__statistic')
  stat.innerHTML = ''
  const stats = {
    amount_bullets: 'number of bullets',
    amount_things: 'raised things',
    amount_zombies: 'killed monsters',
    amount_recovery_hp: 'restore health'
  }
  Object.keys(statistic).forEach(option => {
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
    last_id_player: getIdPlayer()
  });
  playMenu.classList.add('hidden');
  initState();
  startCapturingInput();
  startRendering();
  setLeaderboardHidden(false);
  setExperienceHidden(false)
  setEffectsHidden(false)
  setHealthBarHidden(false)
  setNotifyHidden(false)
  setPassiveSkillsBar(false)
  setActiveSkillsHidden(false)
  setWeaponsBar(false)
  chooseSkin.classList.add('hidden')
  guide.classList.add('hidden')
  contact.classList.add('hidden')
}

Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  usernameInput.focus();
  usernameInput.onkeydown = e => {
    if (e.keyCode === 13) {
      startGame()
    }
  }
  
  playButton.onclick = () => {
    startGame()
  };

  skins.onclick = () => {
    chooseSkin.classList.remove('hidden')
  }
}).catch(console.error);

function onGameOver(statistic) {
  clearKeys()
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
  setExperienceHidden(true)
  setEffectsHidden(true)
  setHealthBarHidden(true)
  setNotifyHidden(true)
  setPassiveSkillsBar(true)
  setActiveSkillsHidden(true)
  setWeaponsBar(true)
  showStatistic(statistic)
  guide.classList.remove('hidden')
  contact.classList.remove('hidden')
}
