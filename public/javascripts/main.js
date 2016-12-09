const frontpage = require('./frontpage')
const search = require('./search')
const schedule = require('./schedule')

frontpage.show()

search.events.on('search', function (selectedItem) {
  schedule.viewItem(0, selectedItem)
})

document.body.style.opacity = 1
