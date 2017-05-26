'use strict'

const express = require('express')
const router = express.Router()
const getUserIndex = require('../lib/getUserIndex')

/* GET home page. */
router.get(['/', '/s/*', '/t/*', '/r/*', '/c/*'], function (req, res, next) {
  getUserIndex().then(users => {
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
  }).catch(function () {
    console.error('Unable to get user info, emergency redirect!')
    res.redirect('http://www.meetingpointmco.nl/Roosters-AL/doc/')
  })
})

module.exports = router
