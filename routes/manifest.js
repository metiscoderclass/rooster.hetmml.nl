'use strict'

const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', function (req, res, next) {
  console.log('got a request')

  const isBeta = process.env.BETA === '1'

  if (isBeta) {
    res.sendFile('manifest.beta.webmanifest', { root: path.join(__dirname, '../public') })
  } else {
    res.sendFile('manifest.webmanifest', { root: path.join(__dirname, '../public') })
  }
})

module.exports = router
