const getURLOfUser = require('./getURLOfUser')

const self = {}

self._nodes = {
  iframe: document.querySelector('iframe')
}

self.viewItem = function (offset, selectedUser) {
  const url = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1)
  self._nodes.iframe.src = url
}

module.exports = self
