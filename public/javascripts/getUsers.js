const Promise = require('bluebird')
// const cheerio = require('cheerio')
const request = Promise.promisify(require('request'))

module.exports = function () {
  return request(`http://${window.location.host}/getUserIndex`)
    .then(data => JSON.parse(data.body))
}
