/* 16-11-2021 URL Change: http://www.meetingpointmco.nl/Roosters-AL/doc/ changed to: https://mmlrooster.msa.nl */
/* 16-11-2021 URL Change: http://www.meetingpointmco.nl/Roosters-AL/TOSweb changed to: https://kiemmrooster.msa.nl */
'use strict'

const express = require('express')
const router = express.Router()
const getMeetingpointData = require('../lib/getMeetingpointData')

/* GET home page. */
router.get('/', function (req, res, next) {
  const baseMeetingpointUrl = process.env.SCHOOL_LEVEL === 'mavo'
/*      ? 'http://www.meetingpointmco.nl/Roosters-AL/TOSweb' */
      ? 'https://kiemmrooster.msa.nl'
/*      : 'http://www.meetingpointmco.nl/Roosters-AL/doc'; */
      : 'https://mmlrooster.msa.nl';
  const school = process.env.SCHOOL === 'kiemm' ? 'kiemm' : 'metis';

  getMeetingpointData().then(data => {
    let flags = []
    if (req.query.nfd != null) {
      flags.push('NO_FEATURE_DETECT')
    }

    const flagsStr = `var FLAGS = ${JSON.stringify(flags)};`
    const usersStr = `var USERS = ${JSON.stringify(data.users)};`
    const validWeekNumbersStr = `var VALID_WEEK_NUMBERS = ${JSON.stringify(data.validWeekNumbers)}`
    res.render('index', {
      school,
      schoolLevel: process.env.SCHOOL_LEVEL === 'mavo' ? 'mavo' : 'havo-vwo',
      baseMeetingpointUrl,
      flagsStr,
      usersStr,
      validWeekNumbersStr
    })
  }).catch(function () {
    console.error('Unable to get user info, emergency redirect!')
    res.render('redirect', {
      school,
      baseMeetingpointUrl,
    })
  })
})

module.exports = router
