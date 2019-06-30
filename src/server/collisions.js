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

function applyCollisionsZombies(zombies, bullets, players) {
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
        if (zombie.hp <= 0) {
          const xp = zombie.type.xp
          players[bullet.parentID].onKilledZombie(xp)
        }
        break
      }
    }
  }
  return destroyedBullets;
}

function applyCollisionsPlayersAndZombies(players, zombies) {
  const damagedPlayers = [];
  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    let full_damage = 0

    for (let j = 0; j < zombies.length; j++) {
      const zombie = zombies[j]
      if (
        player.distanceTo(zombie) <= Constants.PLAYER_RADIUS &&
        zombie.bite
      ) {
        full_damage += zombie.damage
        zombie.cooldownBite()
      }
    }

    if (full_damage > 0) {
      damagedPlayers.push({
        id: player.id,
        damage: full_damage
      });
    }
  }
  return damagedPlayers;
}

function applyCollisionsPlayersAndThings(players, things) {
  const takedThings = []
  for (let i = 0; i < players.length; i++) {
    const player = players[i]

    for (let j = 0; j < things.length; j++) {
      const thing = things[j]
      if (player.distanceTo(thing) <= Constants.PLAYER_RADIUS + Constants.THING_RADIUS) {
        player.takeBuff(thing.options)
        takedThings.push(thing)
      }
    }
  }
  return takedThings
}

module.exports = {
  applyCollisionsPlayers,
  applyCollisionsZombies,
  applyCollisionsPlayersAndZombies,
  applyCollisionsPlayersAndThings
}
