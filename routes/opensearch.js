'use strict'

const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', function (req, res, next) {
  res.setHeader('content-type', 'application/opensearchdescription+xml')
  res.sendFile('opensearch.xml', { root: path.join(__dirname, '../public') })
})

module.exports = router
