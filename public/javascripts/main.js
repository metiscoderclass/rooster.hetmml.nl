/* global ga */

require('flexibility')

const fuzzy = require('fuzzy')
// const getUsers = require('./getUsers')
const getURLOfUser = require('./getURLOfUser')
const removeDiacritics = require('diacritics').remove
const getWeek = require('./getWeek')

const searchNode = document.querySelector('#search')
const inputNode = searchNode.querySelector('input[type="text"]')
const autocompleteNode = document.querySelector('.autocomplete')
const scheduleIframe = document.querySelector('#schedule')
const prevButton = document.querySelectorAll('input[type="button"]')[0]
const nextButton = document.querySelectorAll('input[type="button"]')[1]
const currentWeekNode = document.querySelector('.current')
const favNode = document.querySelector('.fav')

if (window.location.href.split('?')[1] !== 'nfd') { // nfd = no feature detection
  if (document.querySelector('#schedule').getClientRects()[0].bottom !== document.body.offsetHeight) {
    window.location = 'http://www.meetingpointmco.nl/Roosters-AL/doc/'
  } else {
    window.onerror = function () {
      window.location = 'http://www.meetingpointmco.nl/Roosters-AL/doc/'
    }
  }
}

let selectedResult = -1
let selectedUser
let results
let offset = 0

function getUsers () {
  const nodes = document.querySelector('#data')
    .querySelectorAll('.data-user')
  const elements = Array.prototype.slice.call(nodes)
  const users = elements.map(userNode => {
    const type = userNode.querySelector('.data-type').textContent
    const value = userNode.querySelector('.data-value').textContent
    const index = Number(userNode.querySelector('.data-index').textContent)
    return { type, value, index }
  })

  document.querySelector('#data').outerHTML = ''

  return users
}

const users = getUsers()

function getCurrentFav () {
  if (!window.localStorage.getItem('fav')) return
  const favCode = window.localStorage.getItem('fav').split(':')
  const fav = users.filter(user => user.type === favCode[0] && user.index === Number(favCode[1]))
  return fav[0]
}

function changeFav (isFav) {
  if (!selectedUser) return
  if (isFav) {
    window.localStorage.setItem('fav', selectedUser.type + ':' + selectedUser.index)
  } else {
    window.localStorage.removeItem('fav')
  }
  updateFavNode()
}

function usersEqual (user1, user2) {
  if (user1 == null || user2 == null) return false
  return user1.type === user2.type && user1.index === user2.index
}

function updateFavNode () {
  if (usersEqual(getCurrentFav(), selectedUser)) {
    favNode.innerHTML = '&#xE838;'
  } else {
    favNode.innerHTML = '&#xE83A'
  }
}

function updateWeekText () {
  if (offset === 0) currentWeekNode.innerHTML = `Week ${getWeek() + offset}`
  else currentWeekNode.innerHTML = `<strong>Week ${getWeek() + offset}</strong>`
}

updateWeekText()

searchNode.addEventListener('keydown', function (e) {
  if (results && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault()

    if (document.querySelector('.selected')) document.querySelector('.selected').classList.remove('selected')

    const change = e.key === 'ArrowDown' ? 1 : -1
    selectedResult += change
    if (selectedResult < -1) selectedResult = results.length - 1
    else if (selectedResult > results.length - 1) selectedResult = -1

    if (selectedResult !== -1) autocompleteNode.children[selectedResult].classList.add('selected')
  }
})

searchNode.addEventListener('input', function (e) {
  autocompleteNode.innerHTML = ''
  if (inputNode.value.trim() === '') return

  selectedResult = -1
  results = fuzzy.filter(removeDiacritics(inputNode.value), users, {
    extract: function (el) { return removeDiacritics(el.value) }
  }).slice(0, 7)

  results.forEach(function (result) {
    const resultNode = document.createElement('li')
    resultNode.innerHTML = `${result.original.value}`
    autocompleteNode.appendChild(resultNode)
  })
})

searchNode.addEventListener('submit', submitForm)

function submitForm (e) {
  if (e) e.preventDefault()
  if (results != null) {
    const indexInResult = selectedResult === -1 ? 0 : selectedResult
    selectedUser = users[results[indexInResult].index]
  }
  if (selectedUser == null) return

  updateFavNode()

  inputNode.value = selectedUser.value
  autocompleteNode.innerHTML = ''

  inputNode.blur()

  scheduleIframe.src = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1)

  let eventAction
  switch (selectedUser.type) {
    case 'c':
      eventAction = 'Class'
      break
    case 't':
      eventAction = 'Teacher'
      break
    case 'r':
      eventAction = 'Room'
      break
    case 's':
      eventAction = 'Student'
      break
  }
  const eventLabel = selectedUser.value

  ga(function () {
    ga('send', { hitType: 'event', eventCategory: 'search', eventAction, eventLabel })
  })
}

autocompleteNode.addEventListener('click', function (e) {
  if (autocompleteNode.contains(e.target)) {
    selectedResult = Array.prototype.indexOf.call(e.target.parentElement.childNodes, e.target)
    submitForm()
  }
})

prevButton.addEventListener('click', function () {
  offset--
  updateWeekText()
  submitForm()
})

nextButton.addEventListener('click', function () {
  offset++
  updateWeekText()
  submitForm()
})

inputNode.addEventListener('click', function () {
  inputNode.select()
})

inputNode.addEventListener('blur', function () {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  if (!isSafari) {
    inputNode.selectionStart = inputNode.selectionEnd = -1
  }
})

searchNode.addEventListener('blur', function (e) {
  autocompleteNode.innerHTML = ''
})

favNode.addEventListener('click', function () {
  if (usersEqual(getCurrentFav(), selectedUser)) {
    changeFav(false)
  } else {
    changeFav(true)
  }
})

const currentFav = getCurrentFav()

if (currentFav) {
  selectedUser = currentFav
  inputNode.value = selectedUser.value
  scheduleIframe.src = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1)
  updateFavNode()
}
