/* global FLAGS */
/* 16-11-2021 URL Change: http://www.meetingpointmco.nl/Roosters-AL/doc/ changed to: https://mmlrooster.msa.nl */
/* 16-11-2021 URL Change: http://www.meetingpointmco.nl/Roosters-AL/TOSweb changed to: https://kiemmrooster.msa.nl */

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
/*    window.location.href = 'http://www.meetingpointmco.nl/Roosters-AL/TOSweb/' */
      window.location.href = 'https://kiemmrooster.msa.nl/'
  } else {
/*    window.location.href = 'http://www.meetingpointmco.nl/Roosters-AL/doc/' */
      window.location.href = 'https://mmlrooster.msa.nl/'
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
