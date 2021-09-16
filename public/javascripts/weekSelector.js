const EventEmitter = require('events')

const self = new EventEmitter()

self._nodes = {
  prevButton: document.querySelectorAll('#week-selector button')[0],
  nextButton: document.querySelectorAll('#week-selector button')[1],
  currentWeekNode: document.querySelector('#week-selector .current'),
  currentWeekNormalText: document.querySelector('#week-selector .current .no-print'),
  currentWeekPrintText: document.querySelector('#week-selector .current .print')
}

self._weekOffset = 0

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
// 16-11-2021 URL Change: http://www.meetingpointmco.nl/Roosters-AL/doc/ changed to: https://mmlrooster.msa.nl. No effect on this script.
self.getCurrentWeek = function (target) {
  const dayNr = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }

  return 1 + Math.ceil((firstThursday - target) / 604800000)
}

self.getSelectedWeek = function () {
  const now = new Date()
  const targetDate = new Date(now.getTime() +
      self._weekOffset * 604800 * 1000 + 86400 * 1000)
  return self.getCurrentWeek(targetDate)
}

self.updateCurrentWeek = function () {
  const selectedWeekNumber = self.getSelectedWeek()
  if (self.getCurrentWeek(new Date()) !== selectedWeekNumber) {
    self._nodes.currentWeekNode.classList.add('changed')
  } else {
    self._nodes.currentWeekNode.classList.remove('changed')
  }
  self.updateDom()
  self.emit('weekChanged', selectedWeekNumber)
}

self.updateDom = function () {
  const selectedWeekNumber = self.getSelectedWeek()
  const isSunday = new Date().getDay() === 0
  let humanReadableWeek = null
  if (isSunday) {
    switch (self._weekOffset) {
      case 0:
        humanReadableWeek = 'Aanstaande week'
        break
      case 1:
        humanReadableWeek = 'Volgende week'
        break
      case -1:
        humanReadableWeek = 'Afgelopen week'
        break
    }
  } else {
    switch (self._weekOffset) {
      case 0:
        humanReadableWeek = 'Huidige week'
        break
      case 1:
        humanReadableWeek = 'Volgende week'
        break
      case -1:
        humanReadableWeek = 'Vorige week'
        break
    }
  }
  if (humanReadableWeek != null) {
    self._nodes.currentWeekNormalText.textContent = humanReadableWeek + ' • ' + selectedWeekNumber
    self._nodes.currentWeekPrintText.textContent = 'Week ' + selectedWeekNumber
  } else {
    self._nodes.currentWeekNormalText.textContent = 'Week ' + selectedWeekNumber
    self._nodes.currentWeekPrintText.textContent = 'Week ' + selectedWeekNumber
  }
}

self._handlePrevButtonClick = function () {
  self._weekOffset -= 1
  self.updateCurrentWeek()
}

self._handleNextButtonClick = function () {
  self._weekOffset += 1
  self.updateCurrentWeek()
}

self._nodes.prevButton.addEventListener('click', self._handlePrevButtonClick)
self._nodes.nextButton.addEventListener('click', self._handleNextButtonClick)

module.exports = self
