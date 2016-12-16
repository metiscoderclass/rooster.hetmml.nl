const frontpage = require('./frontpage')
const search = require('./search')
const schedule = require('./schedule')
const weekSelector = require('./weekSelector')
const favorite = require('./favorite')
const scrollSnap = require('./scrollSnap')

const state = {}

window.state = state
window.require = require

frontpage.show()
weekSelector.updateCurrentWeek()
scrollSnap.startListening()

if (favorite.get() != null) {
  state.selectedItem = favorite.get()
  favorite.update(state.selectedItem)
  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedItem)
} else {
  search.focus()
}

search.on('search', function (selectedItem) {
  state.selectedItem = selectedItem
  favorite.update(state.selectedItem)
  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedItem)
})

weekSelector.on('weekChanged', function (newWeek) {
  schedule.viewItem(newWeek, state.selectedItem)
})

favorite.on('click', function () {
  favorite.toggle(state.selectedItem)
})

document.body.style.opacity = 1
