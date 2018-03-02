const path = require('path');
const pvwRules = require('./node_modules/paraviewweb/config/webpack.loaders.js');

const entry = path.join(__dirname, './lib/app.js');
const outputPath = path.join(__dirname, './dist');
const eslintrcPath = path.join(__dirname, '.eslintrc.js');

const plugins = [];

module.exports = {
  plugins,
  entry,
  output: {
    path: outputPath,
    filename: 'LightViz.js',
  },
  module: {
    rules: [
      { test: entry, loader: 'expose-loader?LightViz' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        enforce: 'pre',
        options: { configFile: eslintrcPath },
      },
    ].concat(pvwRules),
  },
  resolve: {
    alias: {
      PVWStyle: path.resolve('./node_modules/paraviewweb/style'),
      LightVizStyle: path.join(__dirname, 'style'),
    },
  },
};
