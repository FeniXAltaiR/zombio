// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#2-builds--project-setup
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    https: true,
    // http2: true
    proxy: {
      '/socket.io': {
        target: 'https://qvent.io',
        changeOrigin: true,
        wss: true
      }
    }
  },
});
