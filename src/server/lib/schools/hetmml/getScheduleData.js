const cheerio = require('cheerio');
const debounce = require('promise-debounce');
const _ = require('lodash');

const getUrlOfUser = require('./getURLOfUser');
const axios = require('./axios');

let meetingpointData;
let lastUpdate;

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

function scrapeWeeks(html) {
  const page = cheerio.load(html);
  const weekSelector = page('select[name="week"]');
  const weeks = _.map(weekSelector.children(), option => ({
    id: cheerio(option).attr('value'),
    text: cheerio(option).text(),
  }));

  return weeks;
}

function scrapeAltText(html) {
  const page = cheerio.load(html);
  return page('center > font').eq(2).text().trim();
}

function combineUsers(usersArrays) {
  return _.uniqBy(_.flatten(usersArrays), user => `${user.type}/${user.value}`);
}

function getAlts(users) {
  const requests = users.map(user =>
    axios.get(getUrlOfUser('dag', user.type, user.index, 7)));

  return Promise.all(requests).then(teacherResponses =>
    teacherResponses.map((teacherResponse, index) => {
      const teacherName = scrapeAltText(teacherResponse.data);

      return {
        ...users[index],
        alt: teacherName,
      };
    }));
}

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

module.exports = debounce(getScheduleDataCacheWrapper);
