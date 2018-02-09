module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
  },
  "rules": {
    "strict": "off",
    "react/jsx-filename-extension": ["error", { "extensions": [".js"] }],
    "no-underscore-dangle": ["error", { "allow": ["_test"] }],
    "class-methods-use-this": "off",
    "no-prototype-builtins": "off",
    "react/forbid-prop-types": "off",
    "react/prefer-stateless-function": "off",
  }
};
