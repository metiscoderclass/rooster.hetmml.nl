const express = require('express')
const router = express.Router()
const request = require('request')
const iconv = require('iconv-lite')

const getUserIndex = require('../lib/getUserIndex')
const getURLOfUser = require('../lib/getURLOfUser')

router.get('/:type/:value', function (req, res, next) {
  getUserIndex().then(users => {
    const { type, value } = req.params
    const { week } = req.query
    const user =
      users.filter(user => user.type === type && user.value === value)[0]

    if (!user) {
      next(new Error(`${type}${value} is not in the user index.`))
    }

    const { index } = user

    const url = getURLOfUser(type, index, week)

    request(url, { encoding: null }, function (err, data) {
      if (err) {
        next(err)
        return
      }

      const utf8Body = iconv.decode(data.body, 'ISO-8859-1')
      res.status(data.statusCode).end(utf8Body)
    })
  })
})

module.exports = router
