require('./featureDetect').check()
require('./zoom')

const frontpage = require('./frontpage')
const search = require('./search')
const schedule = require('./schedule')
const weekSelector = require('./weekSelector')
const favorite = require('./favorite')
const scrollSnap = require('./scrollSnap')
const analytics = require('./analytics')
const url = require('./url')

const state = {}

window.state = state

frontpage.show()
weekSelector.updateCurrentWeek()
scrollSnap.startListening()

if (url.hasSelectedUser()) {
  state.selectedUser = url.getSelectedUser()

  favorite.update(state.selectedUser)
  url.update(state.selectedUser)
  analytics.send.search(state.selectedUser)

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser)
} else if (favorite.get() != null) {
  state.selectedUser = favorite.get()

  favorite.update(state.selectedUser)
  url.push(state.selectedUser, false)
  url.update(state.selectedUser)
  analytics.send.search(state.selectedUser, true)

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser)
} else {
  search.focus()
}

search.on('search', function (selectedUser) {
  state.selectedUser = selectedUser

  favorite.update(state.selectedUser)
  url.push(state.selectedUser)
  url.update(state.selectedUser)
  analytics.send.search(state.selectedUser)

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser)
})

url.on('update', function (selectedUser) {
  state.selectedUser = selectedUser

  favorite.update(state.selectedUser)
  url.update(state.selectedUser)

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser)
})

weekSelector.on('weekChanged', function (newWeek) {
  analytics.send.search(state.selectedUser)
  schedule.viewItem(newWeek, state.selectedUser)
})

favorite.on('click', function () {
  favorite.toggle(state.selectedUser)
})

document.body.style.opacity = 1
