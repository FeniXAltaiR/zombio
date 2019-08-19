import escape from 'lodash/escape';

const leaderboard = document.getElementById('leaderboard');
const rows = document.querySelectorAll('#leaderboard table tr');

// <td>${data[i].level} - ${me.experience.skill_points}</td>

// const imgs = [
//   `<img src="../../../assets/passive_skills_hp.svg" alt="" />`,
//   `<img src="../../../assets/passive_skills_hp.svg" alt="" />`,
//   `<img src="../../../assets/passive_skills_hp.svg" alt="" />`,
//   `<img src="../../../assets/passive_skills_hp.svg" alt="" />`,
//   `<img src="../../../assets/passive_skills_hp.svg" alt="" />`
// ]
const img = new Image()
img.src = '../../../assets/passive_skills_hp.svg'

export function updateLeaderboard(data, me) {
  // This is a bit of a hacky way to do this and can get dangerous if you don't escape usernames
  // properly. You would probably use something like React instead if this were a bigger project.
  for (let i = 0; i < data.length; i++) {
    rows[i + 1].innerHTML = `
      <td>${i + 1}</td>
      <td>${escape(data[i].username.slice(0, 15)) || 'Anonymous'}</td>
      <td>${me.score}</td>
    `
  }
  for (let i = data.length; i < 5; i++) {
    rows[i + 1].innerHTML = `
      <td>${i + 1}</td>
      <td>-</td>
      <td>-</td>
    `;
  }
}

export function setLeaderboardHidden(hidden) {
  if (hidden) {
    leaderboard.classList.add('hidden');
  } else {
    leaderboard.classList.remove('hidden');
  }
}
