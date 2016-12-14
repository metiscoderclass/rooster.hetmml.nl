/* global USERS */

const EventEmitter = require('events')
const fuzzy = require('fuzzy')
const autocomplete = require('./autocomplete')
const browserFixToolkit = require('./browserFixToolkit')

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

self.focus = function () {
  self._nodes.input.focus()
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

self._handleFocus = function () {
  self._nodes.input.select()
}

self._handleBlur = function () {
  // this will removed the selection without drawing focus on it (safari)
  // this will removed selection even when focusing an iframe (chrome)
  const oldValue = self._nodes.value
  self._nodes.value = ''
  self._nodes.value = oldValue

  // this will hide the keyboard (iOS safari)
  document.activeElement.blur()
}

autocomplete.on('select', self.submit)

self._nodes.search.addEventListener('submit', self._handleSubmit)
self._nodes.input.addEventListener('focus', self._handleFocus)
self._nodes.input.addEventListener('blur', self._handleBlur)
self._nodes.input.addEventListener(browserFixToolkit.inputEvent,
                                   self._handleTextUpdate)

module.exports = self
