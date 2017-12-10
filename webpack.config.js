const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const js = {
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
  },
};

const style = {
  entry: './src/client/style/index.scss',
  output: {
    path: path.resolve(__dirname, 'src/client/static'),
    filename: 'bundle.css',
  },
  module: {
    rules: [
      {
        test: [/\.scss$/],
        exclude: [/node_modules/],
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader']),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('bundle.css'),
  ],
};

module.exports = [js, style];
