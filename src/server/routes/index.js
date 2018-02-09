const express = require('express');

const router = express.Router();
const getMeetingpointData = require('../lib/getMeetingpointData');

/* GET home page. */
router.get(['/', '/s/*', '/t/*', '/r/*', '/c/*'], (req, res) => {
  getMeetingpointData().then(({ users, dailyScheduleWeeks, basisScheduleWeeks }) => {
    const isBeta = process.env.BETA === '1';

    const flags = [];
    if (isBeta) {
      flags.push('BETA');
      flags.push('NO_FEATURE_DETECT');
    } else if (req.query.nfd != null) {
      flags.push('NO_FEATURE_DETECT');
    }

    const flagsStr = `var FLAGS = ${JSON.stringify(flags)};`;
    const usersStr = `var USERS = ${JSON.stringify(users)};`;
    const dailyScheduleWeeksStr = `var DAGROOSTER_WEEKS = ${JSON.stringify(dailyScheduleWeeks)}`;
    const basisScheduleWeeksStr = `var BASISROOSTER_WEEKS = ${JSON.stringify(basisScheduleWeeks)}`;

    res.render('index', {
      flagsStr,
      usersStr,
      dailyScheduleWeeksStr,
      basisScheduleWeeksStr,
    });
  }).catch(() => {
    console.error('Unable to get user info, emergency redirect!');
    res.render('redirect');
  });
});

module.exports = router;
