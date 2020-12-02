const path = require('path');

const config  = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'idx.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'idx',
    libraryTarget: 'umd',
  },
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

