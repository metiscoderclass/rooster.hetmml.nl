'use strict'

const express = require('express')
const router = express.Router()
const users = require('../lib/getUserIndex')

/* GET home page. */
router.get(['/', '/s/*', '/t/*', '/r/*', '/c/*'], function (req, res, next) {
  let flags = []
  if (req.query.nfd != null) {
    flags.push('NO_FEATURE_DETECT')
  }

  const flagsStr = `var FLAGS = ${JSON.stringify(flags)};`
  const usersStr = `var USERS = ${JSON.stringify(users.users)};`
  res.render('index', { flagsStr, usersStr })
})

module.exports = router
