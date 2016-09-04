var express = require('express')
var router = express.Router()
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

/* GET home page. */
router.get('/:url', function (req, res, next) {
  request(`http://www.meetingpointmco.nl/${req.params.url}`)
    .then(raw => raw.body)
    .then(body => { res.end(body) })
    .catch(next)
})

module.exports = router
