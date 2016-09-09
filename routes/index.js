const express = require('express')
const router = express.Router()
const users = require('../lib/getUserIndex')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { users: users.users })
})

module.exports = router
