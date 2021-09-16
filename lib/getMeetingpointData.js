/* 16-11-2021 URL Change: http://www.meetingpointmco.nl/Roosters-AL/doc/ changed to: https://mmlrooster.msa.nl */
/* 16-11-2021 URL Change: http://www.meetingpointmco.nl/Roosters-AL/TOSweb changed to: https://kiemmrooster.msa.nl */
'use strict'

const Promise = require('bluebird')
const cheerio = require('cheerio')
const _ = require('lodash')
const request = Promise.promisify(require('request'))

let meetingpointData
let lastUpdate

function getUsers (page) {
  const script = page('script').eq(1).text()

  const regexs = [/var classes = \[(.+)\];/, /var teachers = \[(.+)\];/, /var rooms = \[(.+)\];/, /var students = \[(.+)\];/]
  const items = regexs.map(function (regex) {
    const match = script.match(regex)

    if (!match) {
      return []
    }

    return match[1].split(',').map(function (item) {
      return item.replace(/"/g, '')
    })
  })

  return []
  .concat(items[0].map(function (item, index) {
    return {
      type: 'c',
      value: item,
      index: index
    }
  }))
  .concat(items[1].map(function (item, index) {
    return {
      type: 't',
      value: item,
      index: index
    }
  }))
  .concat(items[2].map(function (item, index) {
    return {
      type: 'r',
      value: item,
      index: index
    }
  }))
  .concat(items[3].map(function (item, index) {
    return {
      type: 's',
      value: item,
      index: index
    }
  }))
}

function getValidWeekNumbers(page) {
  const weekSelector = page('select[name="week"]');
  const weekNumbers = _.map(weekSelector.children(), option => parseInt(option.attribs.value))

  return weekNumbers;
}

function requestData() {
  lastUpdate = new Date()

  const url = process.env.SCHOOL_LEVEL === 'mavo'
/*     ? 'http://www.meetingpointmco.nl/Roosters-AL/TOSweb/dagroosters/frames/navbar.htm' */
    ? 'https://kiemmrooster.msa.nl/dagroosters/frames/navbar.htm'
/*    : 'http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/frames/navbar.htm'; */
    : 'https://mmlrooster.msa.nl/dagroosters/frames/navbar.htm';

  console.log(url);

  return request(url, { timeout: 5000 }).then((response) => {
    const page = cheerio.load(response.body)
    console.log('hey')
    const users = getUsers(page)
    console.log(users);
    const validWeekNumbers = getValidWeekNumbers(page)

    meetingpointData = { users, validWeekNumbers }

    return meetingpointData
  })
}

function getMeetingpointData () {
  if (lastUpdate == null || new Date() - lastUpdate > 10 * 60 * 1000) { // 10 minutes
    return requestData()
  } else if (!meetingpointData) {
    return Promise.reject()
  } else {
    return Promise.resolve(meetingpointData)
  }
}

module.exports = getMeetingpointData
