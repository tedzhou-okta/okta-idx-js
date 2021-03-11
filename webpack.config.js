const webpack = require('webpack');
const path = require('path');
const SDK_VERSION = require('./package.json').version;

const config  = {
  // entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'idx.js',
    // path: path.resolve(__dirname, 'dist'),
    library: { 
      name: 'idx',
      type: 'umd',
    },
  },
  // target: ['web', 'es2020'],
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(SDK_VERSION)
    })
  ], 
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
};

module.exports = config;

