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
        options: {
          presets: [
            // Covert code to an older version of JavaScript. This allows us to
            // use newer syntax (like classes) without having to working if it
            // will work in IE9.
            'es2015',
            // This converts the react code syntactical surger to their "plain"
            // javascript equivalents.
            // See https://reactjs.org/docs/introducing-jsx.html#jsx-represents-objects
            'react',
            // This allows us the use newer JavaScript features that are still
            // in the working. Examples are the spread operator (https://babeljs.io/docs/plugins/transform-object-rest-spread/),
            // and class propreties (https://babeljs.io/docs/plugins/transform-class-properties/)
            'stage-2',
          ],
        },
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
