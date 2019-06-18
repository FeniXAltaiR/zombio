const Constants = require('../shared/constants');

// Returns an array of bullets to be destroyed.
function applyCollisionsPlayers(players, bullets) {
  const destroyedBullets = [];
  for (let i = 0; i < bullets.length; i++) {
    // Look for a player (who didn't create the bullet) to collide each bullet with.
    // As soon as we find one, break out of the loop to prevent double counting a bullet.
    for (let j = 0; j < players.length; j++) {
      const bullet = bullets[i];
      const player = players[j];
      if (
        bullet.parentID !== player.id &&
        player.distanceTo(bullet) <= Constants.PLAYER_RADIUS + bullet.radius
      ) {
        destroyedBullets.push(bullet);
        player.takeBulletDamage(bullet);
        break
      }
    }
  }
  return destroyedBullets;
}

function applyCollisionsZombies(zombies, bullets) {
  const destroyedBullets = [];
  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < zombies.length; j++) {
      const bullet = bullets[i];
      const zombie = zombies[j];
      if (
        zombie.distanceTo(bullet) <= Constants.ZOMBIE_RADIUS + bullet.radius
      ) {
        destroyedBullets.push(bullet);
        zombie.takeBulletDamage(bullet);
        break
      }
    }
  }
  return destroyedBullets;
}

function applyCollisionsPlayersAndZombies(players, zombies) {
  const damagedPlayers = [];
  for (let i = 0; i < players.length; i++) {
    let full_damage = 0
    for (let j = 0; j < zombies.length; j++) {
      const player = players[j]
      const zombie = zombies[i]
      if (
        player.distanceTo(zombie) <= Constants.PLAYER_RADIUS + Constants.ZOMBIE_RADIUS
      ) {
        full_damage += zombie.damage
        break
      }
    }
    if (full_damage > 0) {
      damagedPlayers.push({
        id: player.id,
        damage: full_damage
      });
    }
  }
  return destroyedBullets;
}

module.exports = {
  applyCollisionsPlayers,
  applyCollisionsZombies
}
