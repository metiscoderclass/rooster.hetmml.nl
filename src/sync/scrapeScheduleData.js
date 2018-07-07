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

const cheerio = require('cheerio');
const _ = require('lodash');

/**
 * Scrape all the valid users from a meetingpoint navbar.
 * @param {string} html The html of a meetingpoint navbar.
 * @returns {*}
 * [
 *   { type: 't', value: 'akh', index: 0 },
 *   ...
 *   { type: 's', value: '18561', index: 245 },
 *   ...
 *   { type: 'r', value: '008-mk', index: 2 },
 *   ...
 *   { type: 'c', value: '6-5H2', index: 23 },
 *   ...
 * ]
 */
function scrapeUsers(html) {
  const page = cheerio.load(html);
  const script = page('script').eq(1).text();

  const regexs = [/var classes = \[(.+)\];/, /var teachers = \[(.+)\];/, /var rooms = \[(.+)\];/, /var students = \[(.+)\];/];
  const items = regexs.map(regex => script.match(regex)[1].split(',').map(item => item.replace(/"/g, '')));

  const classes = items[0].map((name, index) => ({
    key: `c/${name}`,
    type: 'class',
    name,
    index,
  }));

  const teachers = items[1].map((name, index) => ({
    key: `t/${name}`,
    type: 'teacher',
    name,
    index,
  }));

  const rooms = items[2].map((name, index) => ({
    key: `r/${name}`,
    type: 'room',
    name,
    index,
  }));

  const students = items[3].map((name, index) => ({
    key: `s/${name}`,
    type: 'student',
    name,
    index,
  }));

  return _.flatten([classes, teachers, rooms, students]);
}

/**
 * scrape the alt text (the text next to the short code) from a
 * specific meetingpoint schedule.
 * @param {string} html The html of a specific meetingpoint schedule.
 * @returns {string}
 */
function scrapeAltName(html) {
  const page = cheerio.load(html);
  return page('center > font').eq(2).text().trim() || undefined;
}

module.exports.scrapeUsers = scrapeUsers;
module.exports.scrapeAltName = scrapeAltName;
