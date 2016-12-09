const frontpage = require('./frontpage')
const search = require('./search')
const schedule = require('./schedule')
const weekSelector = require('./weekSelector')

const state = {}

frontpage.show()
weekSelector.updateCurrentWeek()

search.events.on('search', function (selectedItem) {
  state.selectedItem = selectedItem
  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedItem)
})

weekSelector.events.on('weekChanged', function (newWeek) {
  schedule.viewItem(newWeek, state.selectedItem)
})

window.weekSelector = weekSelector

document.body.style.opacity = 1
