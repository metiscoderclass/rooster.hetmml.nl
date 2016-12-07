const frontpage = {}
const self = frontpage

self._nodes = {
  input: document.querySelector('input[type="search"]')
}

self.isShown = false

self.show = function () {
  document.body.classList.add('no-input')
  self.isShown = true
}

self.hide = function () {
  document.body.classList.remove('no-input')
  self.isShown = false
}

self._nodes.input.addEventListener('input', self.hide)

module.exports = frontpage
