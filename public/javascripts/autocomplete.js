const EventEmitter = require('events')
const self = {}

self._items = []
self._selectedItemIndex = -1

self.events = new EventEmitter()

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]'),
  autocomplete: document.querySelector('.autocomplete')
}

self.getSelectedItem = function () {
  if (self.getItems() === []) return

  if (self.getSelectedItemIndex() === -1) {
    return self.getItems()[0]
  } else {
    return self.getItems()[self.getSelectedItemIndex()]
  }
}

self.getSelectedItemIndex = function () {
  return self._selectedItemIndex
}

self.getItems = function () {
  return self._items
}

self.removeAllItems = function () {
  while (self._nodes.autocomplete.firstChild) {
    self._nodes.autocomplete.removeChild(self._nodes.autocomplete.firstChild)
  }
  self._items = []
  self._selectedItemIndex = -1
}

self.addItem = function (item) {
  const listItem = document.createElement('li')
  listItem.textContent = item.value
  self._nodes.autocomplete.appendChild(listItem)
  self._items.push(item)
}

self._moveSelected = function (shift) {
  if (self._selectedItemIndex + shift >= self.getItems().length) {
    self._selectedItemIndex = -1
  } else if (self._selectedItemIndex + shift < -1) {
    self._selectedItemIndex = self.getItems().length - 1
  } else {
    self._selectedItemIndex += shift
  }

  for (let i = 0; i < self.getItems().length; i++) {
    self._nodes.autocomplete.children[i].classList.remove('selected')
  }
  if (self._selectedItemIndex >= 0) {
    self._nodes.autocomplete
        .children[self._selectedItemIndex].classList.add('selected')
  }
}

self._handleItemClick = function (event) {
  if (!self._nodes.autocomplete.contains(event.target)) return
  const itemIndex = Array.prototype.indexOf
      .call(self._nodes.autocomplete.children, event.target)
  self._selectedItemIndex = itemIndex
  self.events.emit('select', self.getSelectedItem())
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
