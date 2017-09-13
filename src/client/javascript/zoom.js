const schedule = require('./schedule')

const self = {}

self._nodes = {
  body: document.body
}

self._handleResize = function () {
  // the table node may not exist before this function is called
  const tableNode = document.querySelector('center > table')

  // infact, it may not even exist when this function is called.
  if (!tableNode) return

  const tableWidth = tableNode.getBoundingClientRect().width
  const tableGoalWidth = self._nodes.body.getBoundingClientRect().width * 0.9
  const zoomFactor = tableGoalWidth / tableWidth

  if (zoomFactor < 1) {
    tableNode.style.zoom = `${zoomFactor}`
  } else {
    tableNode.style.zoom = `1`
  }
}

schedule.on('load', self._handleResize)
window.addEventListener('resize', self._handleResize)

module.exports = self
