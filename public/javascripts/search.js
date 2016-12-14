/* global USERS */

const EventEmitter = require('events')
const fuzzy = require('fuzzy')
const autocomplete = require('./autocomplete')

const self = new EventEmitter()

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]')
}

self.submit = function () {
  self._nodes.input.blur()

  const selectedItem = autocomplete.getSelectedItem()

  console.log(selectedItem)

  self.emit('search', selectedItem)
}

self.updateDom = function (selectedItem) {
  self._nodes.input.value = selectedItem.value
  autocomplete.removeAllItems()
  document.body.classList.remove('no-input')
  document.body.classList.add('searched')
}

self._handleSubmit = function (event) {
  event.preventDefault()
  self.submit()
}

self._calculate = function (searchTerm) {
  const allResults = fuzzy.filter(searchTerm, USERS, {
    extract: item => item.value
  })
  const firstResults = allResults.slice(0, 7)

  const originalResults = firstResults.map(result => result.original)

  return originalResults
}

self._handleTextUpdate = function () {
  const results = self._calculate(self._nodes.input.value)

  autocomplete.removeAllItems()
  for (let i = 0; i < results.length; i++) {
    autocomplete.addItem(results[i])
  }
}

autocomplete.on('select', self.submit)

self._nodes.search.addEventListener('submit', self._handleSubmit)
self._nodes.input.addEventListener('input', self._handleTextUpdate)

module.exports = self
