const Constants = require('../shared/constants');

// Returns an array of bullets to be destroyed.
function applyCollisionsPlayers(players, bullets, zombies) {
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
        if (bullet.damage < player.hp) {
          destroyedBullets.push(bullet)
        }
        player.takeBulletDamage(bullet)
        if (bullet.effect === 'fire') {
          player.activeDebuff('fire')
        } else if (bullet.effect === 'vampire') {
          const id_bullet = bullet.parentID
          const findZombie = zombies.find(zomb => zomb.id === id_bullet)
          if (findZombie) {
            findZombie.updateHp(bullet.damage / 2)
          }
        }
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
        bullet.parentID !== zombie.id &&
        zombie.distanceTo(bullet) <= zombie.radius + bullet.radius
      ) {
        if (bullet.damage < zombie.hp) {
          destroyedBullets.push(bullet)
        }
        zombie.takeBulletDamage(bullet)
        if (zombie.hp <= 0) {
          const xp = zombie.type.xp
          if (players[bullet.parentID]) {
            players[bullet.parentID].onKilledZombie(xp)
            if (['boss_easy', 'boss_normal', 'boss_hard', 'boss_legend'].includes(zombie.type.name)) {
              players[bullet.parentID].activeBossBonus(zombie.type.name)
            }
          }
        }
        if (bullet.effect === 'fire') {
          zombie.activeDebuff('fire')
        } else if (bullet.effect === 'vampire') {
          const id_bullet = bullet.parentID
          const findZombie = zombies.find(zomb => zomb.id === id_bullet)
          if (findZombie) {
            findZombie.updateHp(bullet.damage / 2)
          }
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
        player.distanceTo(zombie) <= Constants.PLAYER_RADIUS + zombie.radius / 2 &&
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
        player.takeBuff(thing.options.name)
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
