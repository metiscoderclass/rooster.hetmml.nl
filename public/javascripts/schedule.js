const getURLOfUser = require('./getURLOfUser')

const self = {}

self._nodes = {
  schedule: document.querySelector('#schedule')
}

self._parseMeetingpointHTML = function (htmlStr) {
  const html = document.createElement('html')
  html.innerHTML = htmlStr
  const centerNode = html.querySelector('center')
  return centerNode
}

self._handleLoad = function (event) {
  const request = event.target
  if (request.status < 200 || request.status >= 400) {
    self._handleError(event)
    return
  }
  const document = self._parseMeetingpointHTML(request.response)
  self._nodes.schedule.appendChild(document)
}

self._handleError = function (event) {
  const request = event.target
  console.error(request)
}

self.viewItem = function (offset, selectedUser) {
  const url = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1)

  while (self._nodes.schedule.firstChild) {
    self._nodes.schedule.removeChild(self._nodes.schedule.firstChild)
  }

  const request = new window.XMLHttpRequest()
  request.addEventListener('load', self._handleLoad)
  request.addEventListener('error', self._handleError)
  request.open('GET', url, true)
  request.send()
}

module.exports = self
