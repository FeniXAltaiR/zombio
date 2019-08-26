// const ASSET_NAMES = [
//   'map.svg',
//   'map_ice.svg',
//   'map2.svg',

//   'bullet.svg',
//   'bullet_ice.svg',
//   'bullet_fire.svg',
//   'bullet_vampire.svg',

//   'zombie_easy.svg',
//   'zombie_normal.svg',
//   'zombie_hard.svg',
//   'zombie_boss_easy.svg',
//   'zombie_boss_normal.svg',
//   'zombie_boss_hard.svg',
//   'zombie_boss_legend.svg',

//   'thing_hp.svg',
//   'thing_speed.svg',
//   'thing_accuracy.svg',
//   'thing_portal.svg',
//   'thing_defense.svg',
//   'thing_damage.svg',

//   'passive_skills_hp.svg',
//   'passive_skills_speed.svg',
//   'passive_skills_defense.svg',
//   'passive_skills_cooldown.svg',
//   'passive_skills_damage.svg',
//   'passive_skills_accuracy.svg',
  
//   'player_man1.svg',
//   'player_man2.svg',
//   'player_man3.svg'
// ];

const ASSET_NAMES = require.context('../../public/assets/', false, /\.(png|svg)$/).keys().map(key => {
  const file = key.replace('./', '')
  return file
})

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      // console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `assets/${assetName}`;
  });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
