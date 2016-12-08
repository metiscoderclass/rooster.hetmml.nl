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
}

self._handleSubmit = function (event) {
  event.preventDefault()
  self.submit()
}

autocomplete.events.on('select', self.submit)

self._nodes.search.addEventListener('submit', self._handleSubmit)
self._nodes.input.addEventListener('focus', autocomplete.show)

// TODO: hide on escape key press
// self._nodes.input.addEventListener('blur', autocomplete.hide)

module.exports = self
