var Promise = require('bluebird')
var request = Promise.promisify(require('request'))

module.exports = function () {
  return request(`http://${window.location.host}/getUserIndex`)
    .then(data => JSON.parse(data.body))
}
