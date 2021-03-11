const webpack = require('webpack');
const path = require('path');
const SDK_VERSION = require('./package.json').version;

const config  = {
  devtool: 'source-map',
  output: {
    filename: 'idx.js',
    library: { 
      name: 'idx',
      type: 'umd',
    },
  },
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
          loader: 'babel-loader',
          options: {
            presets: [[ '@babel/env', {
              // targets or browserlist recommended per babel-preset-env docs
              targets: { // Last update: 2021-03-09
                edge: "17",
                firefox: "70",
                chrome: "77",
                safari: "13",
                ie: "11",
              },
              useBuiltIns: "usage",
              corejs: "3.8", // Minor version recommended per babel-preset-env docs
            }]],
            plugins: [
              ['@babel/plugin-transform-runtime', {
                corejs: 3,
                proposals: true, // required for proposal polyfills
              }]
            ],
          }
        }
      }
    ]
  },
};

module.exports = config;

