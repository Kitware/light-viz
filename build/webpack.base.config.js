const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const autoprefixer = require('autoprefixer');

const externals = require('./externals.js');

const paths = {
  entry: path.join(__dirname, '../src/app.js'),
  source: path.join(__dirname, '../src'),
  externals: path.join(__dirname, '../externals'),
  output: path.join(__dirname, '../dist'),
  root: path.join(__dirname, '..'),
  node_modules: path.join(__dirname, '../node_modules'),
};

module.exports = {
  entry: Object.assign({
    lightviz: paths.entry,
  }, externals.getExternalEntries(paths.externals)),
  output: {
    path: paths.output,
    filename: '[name].js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: paths.entry,
        loader: 'expose-loader?LightViz',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|svg|ttf|woff2?|eot|otf)$/,
        loader: 'url-loader',
        options: {
          limit: 60000,
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[folder]-[local]-[sha512:hash:base32:5]',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new WriteFilePlugin(),
    new CopyPlugin([
      {
        from: path.join(paths.root, 'static'),
      },
    ]),
  ],
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      'pvw-lightviz': paths.root,
    },
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all',
        },
      },
    },
  },
};
