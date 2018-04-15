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
const parseSchedule = require('../lib/schools/hetmml/parseSchedule');

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
function currentWeekNumber() {
  const target = new Date();

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

async function getSchedule(userType, userValue, week, scheduleType = 'dag') {
  const { users } = await getScheduleData();
  const user =
    users.filter(user_ => user_.type === userType && user_.value === userValue)[0];

  if (!user) {
    throw new Error(`${userType}/${userValue} is not in the user index.`);
  }

  if (!week) {
    week = currentWeekNumber(); // eslint-disable-line no-param-reassign
  }

  const { index } = user;
  const url = getURLOfUser(scheduleType, userType, index, week);

  return axios.get(url);
}

router.get('/:type/:value.json', (req, res, next) => {
  const { type, value } = req.params;
  const { week, type: scheduleType } = req.query;

  getSchedule(type, value, week, scheduleType)
    .then((response) => {
      const schedule = parseSchedule(response);
      res.json(schedule);
    })
    .catch((err) => {
      if (err.response) {
        // eslint-disable-next-line no-param-reassign
        err.status = err.response.status;
      }
      next(err);
    });
});

router.get('/:type/:value', (req, res, next) => {
  const { type, value } = req.params;
  const { week, type: scheduleType } = req.query;

  getSchedule(type, value, week, scheduleType)
    .then((response) => {
      res.status(response.status).end(response.data);
    })
    .catch((err) => {
      if (err.response) {
        // eslint-disable-next-line no-param-reassign
        err.status = err.response.status;
      }
      next(err);
    });
});

module.exports = router;
