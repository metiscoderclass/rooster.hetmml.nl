/* global USERS */

const EventEmitter = require('events')

const self = new EventEmitter()

self._getPageTitle = function (selectedItem) {
  if (selectedItem == null) {
    return `Metis Rooster`
  } else {
    return `Metis Rooster - ${selectedItem.value}`
  }
}

self._getPageURL = function (selectedItem) {
  return `/${selectedItem.type}/${selectedItem.value}`
}

self.push = function (selectedItem, push) {
  if (push == null) push = true
  const pageTitle = self._getPageTitle(selectedItem)
  const pageURL = self._getPageURL(selectedItem)
  if (push) {
    window.history.pushState(selectedItem, pageTitle, pageURL)
  } else {
    window.history.replaceState(selectedItem, pageTitle, pageURL)
  }
}

self.update = function (selectedItem) {
  document.title = self._getPageTitle(selectedItem)
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
