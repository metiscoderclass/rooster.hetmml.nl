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
const debounce = require('promise-debounce');
const _ = require('lodash');

const getUrlOfUser = require('./getURLOfUser');
const axios = require('./axios');

let meetingpointData;
let lastUpdate;

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

  const classes = items[0].map((item, index) => ({
    type: 'c',
    value: item,
    index,
  }));

  const teachers = items[1].map((item, index) => ({
    type: 't',
    value: item,
    index,
  }));

  const rooms = items[2].map((item, index) => ({
    type: 'r',
    value: item,
    index,
  }));

  const students = items[3].map((item, index) => ({
    type: 's',
    value: item,
    index,
  }));

  return _.flatten([classes, teachers, rooms, students]);
}

/**
 * Scrape the known valid weeks from a meetingpoint navbar.
 *
 * There probably are more valid weeks, but these once are garanteed to be
 * valid.
 * @param {string} html The html of a meetingpoint navbar.
 * @returns {*} [{ id: string, text: string }, ...]
 */
function scrapeWeeks(html) {
  const page = cheerio.load(html);
  const weekSelector = page('select[name="week"]');
  const weeks = _.map(weekSelector.children(), option => ({
    id: cheerio(option).attr('value'),
    text: cheerio(option).text(),
  }));

  return weeks;
}

/**
 * scrape the alt text (the text next to the short code) from a
 * specific meetingpoint schedule.
 * @param {string} html The html of a specific meetingpoint schedule.
 * @returns {string}
 */
function scrapeAltText(html) {
  const page = cheerio.load(html);
  return page('center > font').eq(2).text().trim();
}

/**
 * Combines two user array, if a dublicate user is present, the first one will
 * be used.
 *
 * This function is currently used to merge a subset of users with alts
 * attached to them with a compleat set of users without alts.
 * @param {*} usersArrays An array of user arrays.
 */
function combineUsers(usersArrays) {
  return _.uniqBy(_.flatten(usersArrays), user => `${user.type}/${user.value}`);
}

/**
 * Requests and adds an alt field to the given users.
 *
 * For example, it will add the teacher name to a teacher object.
 *
 * @param {*} users [{ type: string, value: string, index: number }, ...]
 * @returns {*} [{ type: string, value: string, alt: string, index: number }, ...]
 */
function getAlts(users) {
  const requests = users.map(user =>
    axios.get(getUrlOfUser('dag', user.type, user.index, 7)), { timeout: 8000 });

  return Promise.all(requests).then(teacherResponses =>
    teacherResponses.map((teacherResponse, index) => {
      const teacherName = scrapeAltText(teacherResponse.data);

      return {
        ...users[index],
        alt: teacherName,
      };
    }));
}

/**
 * Requests all the relevent data from the meetingpoint server
 * This is very expensive! Only call when you absolutely need to.
 * @returns {Promise} { users, dailyScheduleWeeks, basisScheduleWeeks }
 */
function getScheduleData() {
  const navbarRequests = [
    axios.get('/dagroosters/frames/navbar.htm'),
    axios.get('/basisroosters/frames/navbar.htm'),
  ];

  return Promise.all(navbarRequests)
    .then(([dailyScheduleResponse, basisScheduleResponse]) => {
      const users = scrapeUsers(dailyScheduleResponse.data);
      const dailyScheduleWeeks = scrapeWeeks(dailyScheduleResponse.data);
      const basisScheduleWeeks = scrapeWeeks(basisScheduleResponse.data);

      const teachers = users.filter(user => user.type === 't');

      return getAlts(teachers)
        .then(teachersWithAlts => ({
          users: combineUsers([teachersWithAlts, users]),
          dailyScheduleWeeks,
          basisScheduleWeeks,
        }))
        .catch(() => ({
          // Just return the user data without the alts if getAlts fails, since
          // the alts are non-essential.
          users,
          dailyScheduleWeeks,
          basisScheduleWeeks,
        }));
    });
}

/**
 * Wrapper around getScheduleData that is cheap to call. In most cases it
 * returns a cached version. The cache is stored for 30 minutes.
 * @returns {Promise} { users, dailyScheduleWeeks, basisScheduleWeeks }
*/
function getScheduleDataCacheWrapper() {
  if (meetingpointData == null || new Date() - lastUpdate > 30 * 60 * 1000) { // 30 minutes
    return getScheduleData().then((meetingpointData_) => {
      lastUpdate = new Date();
      meetingpointData = meetingpointData_;

      return meetingpointData;
    });
  }

  return Promise.resolve(meetingpointData);
}

// Debounce getScheduleDataCacheWrapper. This ensures that no requests will be
// waited if a user requests the schedule data while the schedule data is
// already being requested by another user.
module.exports = debounce(getScheduleDataCacheWrapper);
