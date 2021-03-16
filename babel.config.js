// This file now only exists to allow linting
// This file should be removed once linting is set to use the values
// from webpack.config.js
module.exports = {
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
};


