const Promise = require('bluebird');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const debounce = require('promise-debounce');
const _ = require('lodash');
const request = Promise.promisify(require('request'));

const getUrlOfUser = require('./getURLOfUser');

let meetingpointData;
let lastUpdate;

function getUsers(page) {
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

function getWeeks(page) {
  const weekSelector = page('select[name="week"]');
  const weeks = _.map(weekSelector.children(), option => ({
    id: cheerio(option).attr('value'),
    text: cheerio(option).text(),
  }));

  return weeks;
}

function getAltText(page) {
  return page('center > font').eq(2).text().trim();
}

function requestData() {
  const navbarRequests = [
    request('http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/frames/navbar.htm', { timeout: 5000 }),
    request('http://www.meetingpointmco.nl/Roosters-AL/doc/basisroosters/frames/navbar.htm', { timeout: 5000 }),
  ];

  return Promise.all(navbarRequests)
    .then(([dailyScheduleResponse, basisScheduleResponse]) => {
      const dailySchedulePage = cheerio.load(dailyScheduleResponse.body);
      const basisSchedulePage = cheerio.load(basisScheduleResponse.body);
      const users = getUsers(dailySchedulePage);
      const dailyScheduleWeeks = getWeeks(dailySchedulePage);
      const basisScheduleWeeks = getWeeks(basisSchedulePage);

      const teachers = users.filter(user => user.type === 't');

      const teacherRequests = teachers.map(teacher =>
        request(getUrlOfUser('dag', teacher.type, teacher.index, 7), { encoding: null }));

      return Promise.all(teacherRequests).then((teacherResponses) => {
        const teachersWithAlts = teacherResponses.map((teacherResponse, index) => {
          const utf8Body = iconv.decode(teacherResponse.body, 'iso-8859-1');
          const teacherResponseBody = cheerio.load(utf8Body);

          const teacherName = getAltText(teacherResponseBody);

          return {
            ...teachers[index],
            alt: teacherName,
          };
        });

        return {
          users: _.uniqBy(_.flatten([teachersWithAlts, users]), user => `${user.type}/${user.value}`),
          dailyScheduleWeeks,
          basisScheduleWeeks,
        };
      });
    });
}

function getMeetingpointData() {
  if (meetingpointData == null || new Date() - lastUpdate > 30 * 60 * 1000) { // 30 minutes
    return requestData().then((meetingpointData_) => {
      lastUpdate = new Date();
      meetingpointData = meetingpointData_;

      return meetingpointData;
    });
  }

  return Promise.resolve(meetingpointData);
}

module.exports = debounce(getMeetingpointData);
