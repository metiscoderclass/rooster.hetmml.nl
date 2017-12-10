/* global ga */

const self = {}

self.send = {}

self.send.search = function (selectedUser, favorite) {
  const hitType = 'event'

  const eventCategory = favorite ? 'search fav' : 'search'


  let eventAction
  switch (selectedUser.type) {
    case 'c':
      eventAction = 'Class'
      break
    case 't':
      eventAction = 'Teacher'
      break
    case 'r':
      eventAction = 'Room'
      break
    case 's':
      eventAction = 'Student'
      break
  }

  const eventLabel = selectedUser.value

  ga(function () {
    ga('send', { hitType, eventCategory, eventAction, eventLabel })
  })
}

module.exports = self
