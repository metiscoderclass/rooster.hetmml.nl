const express = require('express')
const router = express.Router()
const request = require('request')
const iconv = require('iconv-lite')

router.get('/', function (req, res, next) {
  console.log(req);
  res.end('Will be implemented soon™!');
})

module.exports = router
