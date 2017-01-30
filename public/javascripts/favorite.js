/* global USERS */

const EventEmitter = require('events')

const self = new EventEmitter()

self._nodes = {
  toggle: document.querySelector('.fav')
}

self.get = function () {
  try {
    const localStorageUser = JSON.parse(window.localStorage.getItem('fav'))
    if (localStorageUser == null) return

    const correctedUser = USERS.filter(function (user) {
      return user.type === localStorageUser.type &&
             user.value === localStorageUser.value
    })[0]
    return correctedUser
  } catch (e) {
    self.delete()
    return
  }
}

self.set = function (user) {
  window.localStorage.setItem('fav', JSON.stringify(user))
  self._nodes.innerHTML = '&#xE838;'
}

self.delete = function () {
  window.localStorage.removeItem('fav')
}

self.updateDom = function (isFavorite) {
  if (isFavorite) {
    self._nodes.toggle.innerHTML = '&#xE838;'
  } else {
    self._nodes.toggle.innerHTML = '&#xE83A'
  }
}

self.update = function (selectedUser) {
  const currentUser = self.get()

  if (currentUser == null || selectedUser == null) {
    self.updateDom(false)
    return
  }

  const isEqual = currentUser.type === selectedUser.type &&
                  currentUser.index === selectedUser.index

  self.updateDom(isEqual)
}

self.toggle = function (selectedUser) {
  const currentUser = self.get()
  const isEqual = currentUser != null &&
                  currentUser.type === selectedUser.type &&
                  currentUser.index === selectedUser.index

  if (isEqual) {
    self.delete()
    self.updateDom(false)
  } else {
    self.set(selectedUser)
    self.updateDom(true)
  }
}

self._handleClick = function () {
  self.emit('click')
}

self._nodes.toggle.addEventListener('click', self._handleClick)

module.exports = self
