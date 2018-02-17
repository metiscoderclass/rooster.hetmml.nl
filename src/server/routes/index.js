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

/* GET home page. */
router.get(['/', '/s/*', '/t/*', '/r/*', '/c/*'], (req, res) => {
  getScheduleData().then(({ users, dailyScheduleWeeks, basisScheduleWeeks }) => {
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
  });
  // .catch(() => {
  //   console.error('Unable to get user info, emergency redirect!');
  //   res.render('redirect');
  // });
});

module.exports = router;
