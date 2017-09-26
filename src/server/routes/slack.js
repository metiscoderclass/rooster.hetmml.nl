const express = require('express')
const router = express.Router()

router.all('/', function (req, res, next) {
  res.json({
    "response_type": "in_channel",
    "text": "Will be implemented soon™!"
  })
})

module.exports = router
