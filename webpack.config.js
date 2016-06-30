var path = require('path');
var webpack = require('webpack');
var loaders = require('./node_modules/paraviewweb/config/webpack.loaders.js');
var plugins = [];

if(process.env.NODE_ENV === 'production') {
  console.log('==> Production build');
  plugins.push(new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production"),
    },
  }));
}

module.exports = {
  plugins: plugins,
  entry: './lib/app.js',
  output: {
    path: './dist',
    filename: 'LightViz.js',
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/,
    }],
    loaders: [
      { test: require.resolve('./lib/app.js'), loader: 'expose?LightViz' },
    ].concat(loaders),
  },
  resolve: {
    alias: {
      PVWStyle: path.resolve('./node_modules/paraviewweb/style'),
      LightVizStyle: path.resolve('./style'),
    },
  },
  postcss: [
    require('autoprefixer')({ browsers: ['last 2 versions'] }),
  ],
  eslint: {
    configFile: '.eslintrc.js',
  },
  externals: {
  },
};
