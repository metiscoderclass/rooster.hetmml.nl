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

const express = require('express');

const router = express.Router();

const getScheduleData = require('../lib/schools/hetmml/getScheduleData');
const getURLOfUser = require('../lib/schools/hetmml/getURLOfUser');
const axios = require('../lib/schools/hetmml/axios');

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
  getScheduleData().then(({ users }) => {
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

    const scheduleType = req.query.type || 'dag';

    const url = getURLOfUser(scheduleType, type, index, week);

    axios.get(url)
      .then((response) => {
        res.status(response.status).end(response.data);
      })
      .catch((err) => {
        next(err);
      });
  });
});

module.exports = router;
