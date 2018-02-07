const express = require('express');

const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  const isBeta = process.env.BETA === '1';

  if (isBeta) {
    res.sendFile('manifest.beta.webmanifest', { root: path.join(__dirname, '../../client/static') });
  } else {
    res.sendFile('manifest.webmanifest', { root: path.join(__dirname, '../../client/static') });
  }
});

module.exports = router;
