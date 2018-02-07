

const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const request = Promise.promisify(require('request'));

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

function getValidWeekNumbers(page) {
  const weekSelector = page('select[name="week"]');
  const weekNumbers = _.map(weekSelector.children(), option => parseInt(option.attribs.value, 10));

  return weekNumbers;
}

function requestData() {
  lastUpdate = new Date();

  return request('http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/frames/navbar.htm', { timeout: 5000 }).then((response) => {
    const page = cheerio.load(response.body);
    const users = getUsers(page);
    const validWeekNumbers = getValidWeekNumbers(page);

    meetingpointData = { users, validWeekNumbers };

    return meetingpointData;
  });
}

function getMeetingpointData() {
  if (lastUpdate == null || new Date() - lastUpdate > 10 * 60 * 1000) { // 10 minutes
    return requestData();
  } else if (!meetingpointData) {
    return Promise.reject();
  }
  return Promise.resolve(meetingpointData);
}

module.exports = getMeetingpointData;
