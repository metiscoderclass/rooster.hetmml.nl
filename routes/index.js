'use strict'

const express = require('express')
const router = express.Router()
const getMeetingpointData = require('../lib/getMeetingpointData')

/* GET home page. */
router.get('/', function (req, res, next) {
  getMeetingpointData().then(data => {
    let flags = []
    if (req.query.nfd != null) {
      flags.push('NO_FEATURE_DETECT')
    }

    const flagsStr = `var FLAGS = ${JSON.stringify(flags)};`
    const usersStr = `var USERS = ${JSON.stringify(data.users)};`
    const validWeekNumbersStr = `var VALID_WEEK_NUMBERS = ${JSON.stringify(data.validWeekNumbers)}`
    res.render('index', { flagsStr, usersStr, validWeekNumbersStr })
  }).catch(function () {
    console.error('Unable to get user info, emergency redirect!')
    res.redirect('http://www.meetingpointmco.nl/Roosters-AL/doc/')
  })
})

module.exports = router
