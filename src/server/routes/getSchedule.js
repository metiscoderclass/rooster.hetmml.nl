const express = require('express');

const router = express.Router();
const request = require('request');
const iconv = require('iconv-lite');

const getMeetingpointData = require('../lib/getMeetingpointData');
const getURLOfUser = require('../lib/getURLOfUser');

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
function getWeekNumber(target) {
  const dayNr = (target.getDay() + 6) % 7;
  // eslint-disable-next-line
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    // eslint-disable-next-line
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }

  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

router.get('/:type/:value', (req, res, next) => {
  getMeetingpointData().then(({ users }) => {
    const { type, value } = req.params;
    let { week } = req.query;
    const user =
      users.filter(user_ => user_.type === type && user_.value === value)[0];

    if (!user) {
      next(new Error(`${type}${value} is not in the user index.`));
    }

    if (!week) {
      week = getWeekNumber(new Date());
    }

    const { index } = user;

    const url = getURLOfUser(type, index, week);

    request(url, { encoding: null }, (err, data) => {
      if (err) {
        next(err);
        return;
      }

      const utf8Body = iconv.decode(data.body, 'ISO-8859-1');

      res.status(data.statusCode).end(utf8Body);
    });
  });
});

module.exports = router;
