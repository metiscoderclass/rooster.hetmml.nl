'use strict'

const Promise = require('bluebird')
const cheerio = require('cheerio')
const request = Promise.promisify(require('request'))

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
      })))
    })
  })
}

getStandardUsers().then(users => {
  exports.users = users
})
