const EventEmitter = require('events')
const leftPad = require('left-pad')
const search = require('./search')

const self = new EventEmitter()

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
  self._removeChilds()
  self._nodes.schedule.appendChild(document)
  self._nodes.schedule.classList.remove('error')
  self.emit('load')
}

self._handleError = function (event) {
  const request = event.target
  let error
  if (request.status === 404) {
    error = 'Sorry, er is (nog) geen rooster voor deze week.'
  } else {
    error = 'Sorry, er is iets mis gegaan tijdens het laden van deze week.'
  }
  self._removeChilds()
  self._nodes.schedule.textContent = error
  self._nodes.schedule.classList.add('error')
  self.emit('load')
}

self._getURLOfUsers = function (week, type, index) {
  const id = index + 1
  const meetingpointURL =
      `Roosters-AL/doc/dagroosters/${leftPad(week, 2, '0')}/${type}/` +
      `${type}${leftPad(id, 5, '0')}.htm`
  return `/meetingpointProxy/${window.encodeURIComponent(meetingpointURL)}`
}

self._removeChilds = function () {
  while (self._nodes.schedule.firstChild) {
    self._nodes.schedule.removeChild(self._nodes.schedule.firstChild)
  }
}

self.viewItem = function (week, selectedUser) {
  if (selectedUser == null) {
    self._removeChilds()
    search.updateDom(selectedUser)
  } else {
    const url = self._getURLOfUsers(week, selectedUser.type,
                                    selectedUser.index)

    self._removeChilds()

    const request = new window.XMLHttpRequest()
    request.addEventListener('load', self._handleLoad)
    request.addEventListener('error', self._handleError)
    request.open('GET', url, true)
    request.send()

    search.updateDom(selectedUser)
  }
}

module.exports = self
