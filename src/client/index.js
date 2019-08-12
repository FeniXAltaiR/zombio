// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
import { connect, play } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput, clearKeys } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';
import { setExperienceHidden } from './experience';
import { setPassiveSkillsBar } from './passive-skills'
import { setWeaponsBar } from './weapons'

// I'm using Bootstrap here for convenience, but I wouldn't recommend actually doing this for a real
// site. It's heavy and will slow down your site - either only use a subset of Bootstrap, or just
// write your own CSS.
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/main.css';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');
const skins = document.querySelector('button[data-name=skins]')
const chooseSkin = document.querySelector('.skins')
const agreeSkinBtn = document.querySelector('.skins__btn')

const getSkinValue = () => {
  const radios = document.querySelectorAll('.skins input[type=radio]')
  let value
  radios.forEach(radio => {
    if (radio.checked) {
      value = radio.value
    }
  })
  return value
}

const showStatistic = statistic => {
  const stat = document.querySelector('.play-menu__statistic')
  stat.innerHTML = ''
  Object.keys(statistic).forEach(option => {
    const p = document.createElement('p')
    p.innerHTML = `${option}: ${Math.round(statistic[option])}`
    stat.appendChild(p)
  })
}

Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  usernameInput.focus();
  playButton.onclick = () => {
    // Play!
    play({
      username: usernameInput.value,
      icon: getSkinValue()
    });
    playMenu.classList.add('hidden');
    initState();
    startCapturingInput();
    startRendering();
    setLeaderboardHidden(false);
    setExperienceHidden(false)
    setPassiveSkillsBar(false)
    setWeaponsBar(false)
  };

  skins.onclick = () => {
    chooseSkin.classList.remove('hidden')
  }

  agreeSkinBtn.onclick = () => {
    chooseSkin.classList.add('hidden')
  }
}).catch(console.error);

function onGameOver(statistic) {
  clearKeys()
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
  setExperienceHidden(true)
  setPassiveSkillsBar(true)
  setWeaponsBar(true)
  showStatistic(statistic)
}
