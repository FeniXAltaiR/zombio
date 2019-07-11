const ASSET_NAMES = [
  'bullet.svg',
  'zombie_easy.svg',
  'zombie_normal.svg',
  'zombie_hard.svg',
  'grass.svg',
  'thing_hp.svg',
  'thing_speed.svg',
  'thing_accuracy.svg',
  'thing_portal.svg',
  'player_man1.svg',
  'player_man2.svg',
  'player_man3.svg'
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
