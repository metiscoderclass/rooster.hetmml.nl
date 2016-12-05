const express = require('express')
const router = express.Router()
const users = require('../lib/getUserIndex')

/* GET home page. */
router.get('/', function (req, res, next) {
  let flags = []
  if (req.query.nfd != null) {
    flags.push('NO_FEATURE_DETECT')
  }

  const flagsStr = `var FLAGS = [${flags.map(flag => `"${flag}"`).toString(', ')}];`
  res.render('index', { flagsStr, users: users.users })
})

module.exports = router
