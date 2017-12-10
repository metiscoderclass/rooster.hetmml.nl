const path = require('path');

module.exports = {
  entry: './src/client/react/index.jsx',
  output: {
    path: path.resolve(__dirname, 'src/client/static'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: [/node_modules/],
        loader: 'babel-loader',
        options: { presets: ['es2015', 'react', 'stage-2'] },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  }
};
