const path = require('path');

module.exports = {
  entry: './src/client/javascript/main.js',
  output: {
    path: path.resolve(__dirname, 'src/client/static'),
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