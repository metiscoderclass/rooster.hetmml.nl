const path = require('path');

module.exports = {
  entry: './public/javascripts/main.js',
  output: {
    path: path.resolve(__dirname, 'public/javascripts'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: [/\.js$/],
        exclude: [/node_modules/],
        loader: 'babel-loader',
        options: { presets: ['es2015'] }
      }
    ]
  }
}