'use strict'

const Promise = require('bluebird')
const cheerio = require('cheerio')
const _ = require('lodash')
const request = Promise.promisify(require('request'))

exports = {}
module.exports = exports

function getUsers (page) {
  const script = page('script').eq(1).text()

  const regexs = [/var classes = \[(.+)\];/, /var teachers = \[(.+)\];/, /var rooms = \[(.+)\];/, /var students = \[(.+)\];/]
  const items = regexs.map(function (regex) {
    return script.match(regex)[1].split(',').map(function (item) {
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
  return request(`http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/frames/navbar.htm`).then((response) => {
    const page = cheerio.load(response.body)
    const users = getUsers(page)
    const validWeekNumbers = getValidWeekNumbers(page)

    return { users, validWeekNumbers }
  })
}

requestData().then(({ users, validWeekNumbers }) => {
  exports.users = users
  exports.validWeekNumbers = validWeekNumbers
})
