var path = require('path'),
    loaders = require('./node_modules/paraviewweb/config/webpack.loaders.js');

module.exports = {
  plugins: [],
  entry: './lib/app.js',
  output: {
    path: './dist',
    filename: 'LightViz.js',
  },
  module: {
        preLoaders: [{
            test: /\.js$/,
            loader: "eslint-loader",
            exclude: /node_modules/,
        }],
    loaders: [
      { test: require.resolve("./lib/app.js"), loader: "expose?LightViz" },
    ].concat(loaders),
  },
  resolve: {
        alias: {
            PVWStyle: path.resolve('./node_modules/paraviewweb/style'),
            LightVizStyle: path.resolve('./style'),
        },
    },
  eslint: {
        configFile: '.eslintrc.js',
  },
  externals: {
    "three": "THREE",
  },
};
