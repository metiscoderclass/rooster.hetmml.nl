const autocomplete = {}
const self = autocomplete

self._nodes = {
  input: document.querySelector('input[type="search"]'),
  autocomplete: document.querySelector('.autocomplete')
}

self._textUpdate = function () {
  self._nodes.autocomplete
}

self._nodes.input.addEventListener('input', self.hide)

module.exports = autocomplete
