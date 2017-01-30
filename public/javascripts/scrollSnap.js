require('smoothscroll-polyfill').polyfill()

const self = {}
const schedule = require('./schedule')

self._nodes = {
  search: document.querySelector('#search'),
  weekSelector: document.querySelector('#week-selector')
}

self._timeoutID = null

self._getScrollPosition = function () {
  return (document.documentElement && document.documentElement.scrollTop) ||
         document.body.scrollTop
}

self._handleDoneScrolling = function () {
  const scrollPosition = self._getScrollPosition()
  const weekSelectorHeight =
      self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight
  if (scrollPosition < weekSelectorHeight && scrollPosition > 0) {
    window.scroll({ top: weekSelectorHeight, left: 0, behavior: 'smooth' })
  }
}

self._handleScroll = function () {
  if (self._timeoutID != null) window.clearTimeout(self._timeoutID)
  self._timeoutID = window.setTimeout(self._handleDoneScrolling, 500)

  const scrollPosition = self._getScrollPosition()
  const weekSelectorHeight =
      self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight
  if (scrollPosition >= weekSelectorHeight) {
    document.body.classList.add('week-selector-not-visible')
  } else {
    document.body.classList.remove('week-selector-not-visible')
  }
}

self._handleWindowResize = function () {
  const weekSelectorHeight =
      self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight
  const extraPixelsNeeded =
      weekSelectorHeight - (document.body.clientHeight - window.innerHeight)
  if (extraPixelsNeeded > 0) {
    document.body.style.marginBottom = extraPixelsNeeded + 'px'
  } else {
    document.body.style.marginBottom = null
  }
}

self.startListening = function () {
  window.addEventListener('scroll', self._handleScroll)
}

schedule.on('load', self._handleWindowResize)
window.addEventListener('resize', self._handleWindowResize)
module.exports = self
