const EventEmitter = require('events')

const self = new EventEmitter()

self._users = []
self._selectedUserIndex = -1

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]'),
  autocomplete: document.querySelector('.autocomplete')
}

self.getSelectedUser = function () {
  if (self.getItems() === []) return

  if (self.getSelectedUserIndex() === -1) {
    return self.getItems()[0]
  } else {
    return self.getItems()[self.getSelectedUserIndex()]
  }
}

self.getSelectedUserIndex = function () {
  return self._selectedUserIndex
}

self.getItems = function () {
  return self._users
}

self.removeAllItems = function () {
  while (self._nodes.autocomplete.firstChild) {
    self._nodes.autocomplete.removeChild(self._nodes.autocomplete.firstChild)
  }
  self._users = []
  self._selectedUserIndex = -1
}

self.addItem = function (user) {
  const listItem = document.createElement('li')
  listItem.textContent = user.value
  self._nodes.autocomplete.appendChild(listItem)
  self._users.push(user)
}

self._moveSelected = function (shift) {
  if (self._selectedUserIndex + shift >= self.getItems().length) {
    self._selectedUserIndex = -1
  } else if (self._selectedUserIndex + shift < -1) {
    self._selectedUserIndex = self.getItems().length - 1
  } else {
    self._selectedUserIndex += shift
  }

  for (let i = 0; i < self.getItems().length; i++) {
    self._nodes.autocomplete.children[i].classList.remove('selected')
  }
  if (self._selectedUserIndex >= 0) {
    self._nodes.autocomplete
        .children[self._selectedUserIndex].classList.add('selected')
  }
}

self._handleItemClick = function (event) {
  if (!self._nodes.autocomplete.contains(event.target)) return
  const userIndex = Array.prototype.indexOf
      .call(self._nodes.autocomplete.children, event.target)
  self._selectedUserIndex = userIndex
  self.emit('select', self.getSelectedUser())
}

self._handleKeydown = function (event) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (event.key === 'ArrowDown') {
      self._moveSelected(1)
    } else if (event.key === 'ArrowUp') {
      self._moveSelected(-1)
    }
  }
}

self._nodes.autocomplete.addEventListener('click', self._handleItemClick)
self._nodes.input.addEventListener('keydown', self._handleKeydown)

module.exports = self
