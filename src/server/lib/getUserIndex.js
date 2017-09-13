'use strict'

const Promise = require('bluebird')
const cheerio = require('cheerio')
const request = Promise.promisify(require('request'))

let userIndex
let lastUpdate

function updateUserIndex () {
  return new Promise(function (resolve, reject) {
    process.stdout.write('Updating user index... ')
    request(`http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/frames/navbar.htm`)
      .then(function (page) {
        lastUpdate = new Date()
        page = page.body

        const $ = cheerio.load(page)
        const $script = $('script').eq(1)
        const scriptText = $script.text()

        const regexs = [/var classes = \[(.+)];/, /var teachers = \[(.+)];/, /var rooms = \[(.+)];/, /var students = \[(.+)];/]
        const items = regexs.map(function (regex) {
          return scriptText.match(regex)[1].split(',').map(function (item) {
            return item.replace(/"/g, '')
          })
        })

        userIndex = ([]
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

        process.stdout.write('done.\n')

        resolve(userIndex)
      })
      .catch(error => {
        process.stdout.write('failed.\n')
        reject(error)
      })
  })
}

function getUserIndex () {
  return new Promise((resolve, reject) => {
    if (lastUpdate == null) {
      updateUserIndex().then(resolve, reject)
    } else if (new Date() - lastUpdate > 10 * 60 * 1000) { // 10 minutes
      updateUserIndex().then(resolve, function () {
        console.warn('Unable to update userIndex, using cached.')
        resolve(userIndex)
      })
    } else {
      resolve(userIndex)
    }
  })
}

module.exports = getUserIndex
