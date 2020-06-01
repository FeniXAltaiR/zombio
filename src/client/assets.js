const asset_names = require
  .context('../../public/assets/', false, /\.(png|svg)$/)
  .keys()
  .map((key) => {
    const file = key.replace('./', '')
    return file
  })

const assets = {}

const downloadPromise = Promise.all(asset_names.map(downloadAsset))

function downloadAsset(assetName) {
  return new Promise((resolve) => {
    const asset = new Image()
    asset.src = `assets/${assetName}`
    asset.onload = () => {
      assets[assetName] = asset
      resolve()
    }
  })
}

export const downloadAssets = () => downloadPromise

export const getAsset = (assetName) => assets[assetName]
