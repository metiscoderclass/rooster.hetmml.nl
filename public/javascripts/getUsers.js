const Promise = require('bluebird')
const cheerio = require('cheerio')
const request = Promise.promisify(require('request'))
const ty = require('then-yield').using(Promise.cast)

module.exports = ty.async(function * () {
  const page = (yield request(`http://${window.location.host}/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2Fframes%2Fnavbar.htm`)).body
  const $ = cheerio.load(page)
  const $script = $('script').eq(1)
  const scriptText = $script.text()

  const regexs = [/var classes = \[(.+)\];/, /var teachers = \[(.+)\];/, /var rooms = \[(.+)\];/, /var students = \[(.+)\];/]
  const items = regexs.map(regex => scriptText.match(regex)[1].split(',').map(item => item.replace(/"/g, '')))

  return []
    .concat(items[0].map((item, index) => ({
      type: 'c',
      value: item,
      index: index
    })))
    .concat(items[1].map((item, index) => ({
      type: 't',
      value: item,
      index: index
    })))
    .concat(items[2].map((item, index) => ({
      type: 'r',
      value: item,
      index: index
    })))
    .concat(items[3].map((item, index) => ({
      type: 's',
      value: item,
      index: index
    })))
})
