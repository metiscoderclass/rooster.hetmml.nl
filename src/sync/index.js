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

const moment = require('moment');

const axios = require('../shared/lib/axios');
const { insertUsers } = require('../shared/lib/db');
const getUrlOfUser = require('../shared/lib/getURLOfUser');
const { scrapeUsers, scrapeAltName } = require('./scrapeScheduleData');

moment.locale('nl');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchUsers() {
  const navBar = await axios.get('/dagroosters/frames/navbar.htm');
  const users = scrapeUsers(navBar.data);

  return users;
}

async function fetchAltNameOfUser(user) {
  const url = getUrlOfUser('dag', user.type, user.index, moment().week());
  const schedule = await axios.get(url);
  const altName = scrapeAltName(schedule.data);
  return altName;
}

function simplifyNameOfUser(user) {
  if (user.type === 'class') {
    return {
      ...user,
      name: user.name.slice(2),
    };
  }

  return user;
}

async function sync() {
  const users = (await fetchUsers()).map(simplifyNameOfUser);

  const alts = [];

  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  const teachers = users.filter(user => user.type === 'teacher')
    .slice(0, 3); // TODO: Remove this.
  for (const teacher of teachers) {
    await delay(500);
    const altName = await fetchAltNameOfUser(teacher);
    console.log(`${teacher.key}: ${altName}`);
    if (altName) {
      alts.push({ key: teacher.key, altName });
    }
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */

  const usersWithAlts = users.map((user) => {
    const { altName } = (
      alts.find(altUser => altUser.key === user.key) || { altName: undefined }
    );

    return {
      ...user,
      altName,
    };
  });

  await insertUsers(usersWithAlts);
  console.log(usersWithAlts.filter(user => user.type === 'teacher'));
}

sync()
  .then(() => {
    process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
