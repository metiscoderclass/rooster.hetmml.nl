'use strict'

const express = require('express')
const router = express.Router()
const getUserIndex = require('../lib/getUserIndex')

getUserIndex().then(users => {
  /* GET home page. */
  router.get(['/', '/s/*', '/t/*', '/r/*', '/c/*'], function (req, res, next) {
    const isBeta = process.env.BETA === '1'

    let flags = []
    if (isBeta) {
      flags.push('BETA')
      flags.push('NO_FEATURE_DETECT')
    } else if (req.query.nfd != null) {
      flags.push('NO_FEATURE_DETECT')
    }

    const flagsStr = `var FLAGS = ${JSON.stringify(flags)};`
    const usersStr = `var USERS = ${JSON.stringify(users)};`

    res.render('index', { flagsStr, usersStr, isBeta })
  })
}, error => {
  console.error('Unable to get user info, emergency redirect!')
  console.error('Error:', error)

  router.get(['/', '/s/*', '/t/*', '/r/*', '/c/*'], function (req, res, next) {
    res.redirect('http://www.meetingpointmco.nl/Roosters-AL/doc/')
  })
})

module.exports = router
