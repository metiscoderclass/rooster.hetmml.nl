/* global USERS */

const EventEmitter = require('events')

const self = new EventEmitter()

self.update = function (selectedItem) {
  const pageTitle = `Metis Rooster - ${selectedItem.value}`
  const pageUrl = `/${selectedItem.type}/${selectedItem.value}`
  window.history.pushState(selectedItem, pageTitle, pageUrl)
}

self.hasSelectedItem = function () {
  const pageUrl = window.location.pathname
  return /^\/s\/|^\/t\/|^\/r\/|^\/c\//.test(pageUrl)
}

self.getSelectedItem = function () {
  const pageUrl = window.location.pathname
  const pageUrlData = pageUrl.split('/')
  const type = pageUrlData[1]
  const value = pageUrlData[2]

  const user = USERS.filter(function (user) {
    return user.type === type &&
           user.value === value
  })[0]

  return user
}

self._handleUpdate = function (event) {
  self.emit('update', event.state)
}

window.addEventListener('popstate', self._handleUpdate)

module.exports = self
