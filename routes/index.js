const express = require('express')
const router = express.Router()
const users = require('../lib/getUserIndex')

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.query.v === 'n') {
    res.render('index', { version: 'new', users: users.users })
  } else {
    res.render('index', { version: 'old', users: users.users })
  }
})

module.exports = router
