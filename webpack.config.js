const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/client/react/index.js',
  output: {
    path: path.resolve(__dirname, 'src/client/static'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: 'babel-loader',
        options: { presets: ['es2015', 'react', 'stage-2'] },
      },
      {
        test: /\.css/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]--[name]--[hash:base64:5]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // Only load the dutch local for moment.js
    // https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack#25426019
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /nl/),
  ],
};
