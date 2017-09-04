'use strict'

const express = require('express')
const router = express.Router()
const data = require('../lib/getUserIndex')

/* GET home page. */
router.get('/', function (req, res, next) {
  let flags = []
  if (req.query.nfd != null) {
    flags.push('NO_FEATURE_DETECT')
  }

  const flagsStr = `var FLAGS = ${JSON.stringify(flags)};`
  const usersStr = `var USERS = ${JSON.stringify(data.users)};`
  const validWeekNumbersStr = `var VALID_WEEK_NUMBERS = ${JSON.stringify(data.validWeekNumbers)}`
  res.render('index', { flagsStr, usersStr, validWeekNumbersStr })
})

module.exports = router
