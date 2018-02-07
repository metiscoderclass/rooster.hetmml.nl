const express = require('express');

const router = express.Router();
const getMeetingpointData = require('../lib/getMeetingpointData');

/* GET home page. */
router.get(['/', '/s/*', '/t/*', '/r/*', '/c/*'], (req, res) => {
  getMeetingpointData().then((data) => {
    const isBeta = process.env.BETA === '1';

    const flags = [];
    if (isBeta) {
      flags.push('BETA');
      flags.push('NO_FEATURE_DETECT');
    } else if (req.query.nfd != null) {
      flags.push('NO_FEATURE_DETECT');
    }

    const flagsStr = `var FLAGS = ${JSON.stringify(flags)};`;
    const usersStr = `var USERS = ${JSON.stringify(data.users)};`;
    const validWeekNumbersStr = `var VALID_WEEK_NUMBERS = ${JSON.stringify(data.validWeekNumbers)}`;

    res.render('index', { flagsStr, usersStr, validWeekNumbersStr });
  }).catch(() => {
    console.error('Unable to get user info, emergency redirect!');
    res.render('redirect');
  });
});

module.exports = router;
