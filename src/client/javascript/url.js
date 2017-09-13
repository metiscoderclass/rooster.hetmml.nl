/* global USERS FLAGS */

const EventEmitter = require('events')

const self = new EventEmitter()

self._getPageTitle = function (selectedUser) {
  let ret

  if (selectedUser == null) {
    ret = `Metis Rooster`
  } else {
    ret = `Metis Rooster - ${selectedUser.value}`
  }

  if (FLAGS.indexOf('BETA') !== -1) {
    ret = `BETA ${ret}`
  }

  return ret
}

self._getPageURL = function (selectedUser) {
  return `/${selectedUser.type}/${selectedUser.value}`
}

self.push = function (selectedUser, push) {
  if (push == null) push = true
  const pageTitle = self._getPageTitle(selectedUser)
  const pageURL = self._getPageURL(selectedUser)
  if (push) {
    window.history.pushState(selectedUser, pageTitle, pageURL)
  } else {
    window.history.replaceState(selectedUser, pageTitle, pageURL)
  }
}

self.update = function (selectedUser) {
  document.title = self._getPageTitle(selectedUser)
}

self.hasSelectedUser = function () {
  const pageUrl = window.location.pathname
  return /^\/s\/|^\/t\/|^\/r\/|^\/c\//.test(pageUrl)
}

self.getSelectedUser = function () {
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
