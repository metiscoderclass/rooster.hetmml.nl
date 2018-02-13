const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const js = {
  entry: './src/client/react/index.js',
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
  plugins: [
    // Only load the dutch local for moment.js
    // https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack#25426019
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /nl/),
  ],
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
