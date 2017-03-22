'use strict'

const express = require('express')
const router = express.Router()

router.get('/', function (req, res, next) {
  console.log('got a request')

  const isBeta = process.env.BETA === '1'

  if (isBeta) {
    res.sendFile('manifest.beta.webmanifest', { root: './public' })
  } else {
    res.sendFile('manifest.webmanifest', { root: './public' })
  }
})

module.exports = router
