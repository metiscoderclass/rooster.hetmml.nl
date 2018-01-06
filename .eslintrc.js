module.exports = {
  "extends": "airbnb",
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
  },
  "rules": {
    "react/jsx-filename-extension": ["error", { "extensions": [".js"] }],
    "no-underscore-dangle": ["error", { "allow": ["_test"] }],
  }
};
