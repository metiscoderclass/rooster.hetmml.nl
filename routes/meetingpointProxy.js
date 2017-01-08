var express = require('express')
var router = express.Router()
const request = require('request')

/* GET home page. */
router.get('/:url', function (req, res, next) {
  const url = `http://www.meetingpointmco.nl/${req.params.url}`
  request(url, function (err, data) {
    if (err) {
      next(err)
      return
    }
    res.status(data.statusCode).end(data.body)
  })
})

module.exports = router
