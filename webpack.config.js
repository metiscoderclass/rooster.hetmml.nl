/**
 * Copyright (C) 2018 Noah Loomans
 *
 * This file is part of rooster.hetmml.nl.
 *
 * rooster.hetmml.nl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rooster.hetmml.nl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with rooster.hetmml.nl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
      },
      {
        // This allows us to import .scss files. When importing an .scss file
        // from JavaScript, it will automatically be converted to normal css and
        // injected to the head on page load.
        test: /\.scss/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  plugins: [
    // Only load the dutch local for moment.js. This is simply to reduce the
    // side of the bundle that we send down to the browser.
    // https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack#25426019
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /nl/),
  ],
};
