const leftPad = require('left-pad'); // I imported this just to piss you off ;)

function getURLOfUser(scheduleType, type, index, week) {
  return `http://www.meetingpointmco.nl/Roosters-AL/doc/${scheduleType}roosters/` +
    `${leftPad(week, 2, '0')}/${type}/${type}${leftPad(index + 1, 5, '0')}.htm`;
}

module.exports = getURLOfUser;
