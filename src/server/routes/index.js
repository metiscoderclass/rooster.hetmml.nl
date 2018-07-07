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
const { getUsers } = require('../../shared/lib/db');

/* GET home page. */
router.get(['/', '/student/*', '/teacher/*', '/room/*', '/class/*'], (req, res) => {
  getUsers().then((users) => {
    res.render('index', {
      usersStr: JSON.stringify(users),
    });
  });
  // .catch(() => {
  //   console.error('Unable to get user info, emergency redirect!');
  //   res.render('redirect');
  // });
});

module.exports = router;
