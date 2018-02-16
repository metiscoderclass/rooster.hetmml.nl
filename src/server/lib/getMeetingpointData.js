const Promise = require('bluebird');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const debounce = require('promise-debounce');
const _ = require('lodash');
const request = Promise.promisify(require('request'));

const getUrlOfUser = require('./getURLOfUser');

let meetingpointData;
let lastUpdate;

function parseUsers(page) {
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

function parseWeeks(page) {
  const weekSelector = page('select[name="week"]');
  const weeks = _.map(weekSelector.children(), option => ({
    id: cheerio(option).attr('value'),
    text: cheerio(option).text(),
  }));

  return weeks;
}

function parseAltText(page) {
  return page('center > font').eq(2).text().trim();
}

function combineUsers(usersArrays) {
  return _.uniqBy(_.flatten(usersArrays), user => `${user.type}/${user.value}`);
}

function getAlts(users) {
  const requests = users.map(user =>
    request(getUrlOfUser('dag', user.type, user.index, 7), { encoding: null }));

  return Promise.all(requests).then((teacherResponses) => {
    return teacherResponses.map((teacherResponse, index) => {
      const utf8Body = iconv.decode(teacherResponse.body, 'iso-8859-1');
      const teacherResponseBody = cheerio.load(utf8Body);

      const teacherName = parseAltText(teacherResponseBody);

      return {
        ...users[index],
        alt: teacherName,
      };
    });
  });
}

function getMeetingpointData() {
  const navbarRequests = [
    request('http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/frames/navbar.htm', { timeout: 5000 }),
    request('http://www.meetingpointmco.nl/Roosters-AL/doc/basisroosters/frames/navbar.htm', { timeout: 5000 }),
  ];

  return Promise.all(navbarRequests)
    .then(([dailyScheduleResponse, basisScheduleResponse]) => {
      const dailySchedulePage = cheerio.load(dailyScheduleResponse.body);
      const basisSchedulePage = cheerio.load(basisScheduleResponse.body);

      const users = parseUsers(dailySchedulePage);
      const dailyScheduleWeeks = parseWeeks(dailySchedulePage);
      const basisScheduleWeeks = parseWeeks(basisSchedulePage);

      const teachers = users.filter(user => user.type === 't');

      return getAlts(teachers).then(teachersWithAlts => ({
        users: combineUsers([teachersWithAlts, users]),
        dailyScheduleWeeks,
        basisScheduleWeeks,
      }));
    });
}

function getMeetingpointDataCacheWrapper() {
  if (meetingpointData == null || new Date() - lastUpdate > 30 * 60 * 1000) { // 30 minutes
    return getMeetingpointData().then((meetingpointData_) => {
      lastUpdate = new Date();
      meetingpointData = meetingpointData_;

      return meetingpointData;
    });
  }

  return Promise.resolve(meetingpointData);
}

module.exports = debounce(getMeetingpointDataCacheWrapper);
