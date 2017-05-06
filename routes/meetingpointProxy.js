const express = require('express')
const router = express.Router()
const request = require('request')
const iconv = require('iconv-lite')

router.get('/:url', function (req, res, next) {
  const url = `http://www.meetingpointmco.nl/${req.params.url}`
  request(url, { encoding: null }, function (err, data) {
    if (err) {
      next(err)
      return
    }

    const utf8Body = iconv.decode(data.body, 'ISO-8859-1')
    res.status(data.statusCode).end(utf8Body)
  })
})

module.exports = router
