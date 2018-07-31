/* global FLAGS */

const self = {}

self._nodes = {
  input: document.querySelector('input[type="search"]'),
  overflowButton: document.querySelector('#overflow-button')
}

self._shouldCheck = function () {
  return FLAGS.indexOf('NO_FEATURE_DETECT') === -1
}

self._redirect = function () {
  if (process.env.SCHOOL_LEVEL === 'mavo') {
    window.location.href = 'http://www.meetingpointmco.nl/Roosters-AL/TOSweb/'
  } else {
    window.location.href = 'http://www.meetingpointmco.nl/Roosters-AL/doc/'
  }
}

self.check = function () {
  if (!self._shouldCheck()) return

  window.onerror = self._redirect

  if (self._nodes.input.getClientRects()[0].top !==
      self._nodes.overflowButton.getClientRects()[0].top) {
    self._redirect()
  }
}

module.exports = self
