var leftPad = require('left-pad')
var getWeek = require('./getWeek')

function getURLOfUsers (weekOffset, type, id) {
  return `http://${window.location.host}/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F` +
      `${(getWeek() + weekOffset)}%2F${type}%2F${type}${leftPad(id, 5, '0')}.htm`
}

module.exports = getURLOfUsers
