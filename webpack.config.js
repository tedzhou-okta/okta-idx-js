const path = require('path');

const config  = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: { 
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-optional-chaining']
          }
        }
      }
    ]
  },
};

module.exports = (env, argv) => { 
  // Adjust config based on passed mode
  if( argv.mode === 'development') { 
    config.devtool = 'source-map';
  }
  return config;
};

