const Promise = require('bluebird')
const cheerio = require('cheerio')
const request = Promise.promisify(require('request'))
const getURLOfUsers = require('../lib/getURLOfUsers')
const encoding = require('encoding')

exports = {}
module.exports = exports

function getStandardUsers () {
  return new Promise(function (resolve, reject) {
    request(`http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/frames/navbar.htm`)
    .then(function (page) {
      page = page.body

      const $ = cheerio.load(page)
      const $script = $('script').eq(1)
      const scriptText = $script.text()

      const regexs = [/var classes = \[(.+)\];/, /var teachers = \[(.+)\];/, /var rooms = \[(.+)\];/, /var students = \[(.+)\];/]
      const items = regexs.map(function (regex) {
        return scriptText.match(regex)[1].split(',').map(function (item) {
          return item.replace(/"/g, '')
        })
      })

      resolve([]
      .concat(items[0].map(function (item, index) {
        return {
          type: 'c',
          value: item,
          index: index,
          other: '',
          isID: true
        }
      }))
      .concat(items[1].map(function (item, index) {
        return {
          type: 't',
          value: item,
          index: index,
          other: '',
          isID: true
        }
      }))
      .concat(items[2].map(function (item, index) {
        return {
          type: 'r',
          value: item,
          index: index,
          other: '',
          isID: true
        }
      }))
      .concat(items[3].map(function (item, index) {
        return {
          type: 's',
          value: item,
          index: index,
          other: '',
          isID: true
        }
      })))
    })
  })
}

function addExtendedUsers (standardUsers) {
  const standardUsersLength = standardUsers.length
  for (let i = 0; i < standardUsersLength; i++) {
  // for (let i = 200; i < 220; i++) {
    request(getURLOfUsers(0, standardUsers[i].type, standardUsers[i].index + 1))
    .then(page => page.body)
    .then(page => encoding.convert(page, 'UTF-8', 'Windows-1252'))
    .then(function (page) {
      const $ = cheerio.load(page)
      let extendedName = $('font').eq(2).text().trim()

      if (standardUsers[i].type === 's' || standardUsers[i].type === 't') {
        extendedName = extendedName.split(/\s+/).reverse().join(' ')
      }

      if (extendedName.indexOf(standardUsers[i].value) === -1 &&
      extendedName.indexOf(standardUsers[i].value.substring(2, standardUsers[i].value.length))) {
        console.log(`added ${extendedName}: ${standardUsers[i].value}`)
        standardUsers[i].other = extendedName
        standardUsers.push({
          type: standardUsers[i].type,
          index: standardUsers[i].index,
          value: extendedName,
          other: standardUsers[i].value,
          isID: false
        })
      }
    })
  }
}

getStandardUsers().then(users => {
  addExtendedUsers(users)
  exports.users = users
})
