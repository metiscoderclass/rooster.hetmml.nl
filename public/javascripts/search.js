/* global USERS */

const fuzzy = require('fuzzy')
const autocomplete = require('./autocomplete')
const iframe = require('./iframe')

const self = {}

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]')
}

self.submit = function () {
  self._nodes.input.blur()

  const selectedItem = autocomplete.getSelectedItem()
  console.log(selectedItem)
  iframe.viewItem(0, selectedItem)

  autocomplete.hide()
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

autocomplete.events.on('select', self.submit)

self._nodes.search.addEventListener('submit', self._handleSubmit)
self._nodes.input.addEventListener('input', self._handleTextUpdate)
self._nodes.input.addEventListener('focus', autocomplete.show)

// TODO: hide on escape key press
// self._nodes.input.addEventListener('blur', autocomplete.hide)

module.exports = self
