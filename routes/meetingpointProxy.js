const express = require('express')
const router = express.Router()
const request = require('request')
const iconv = require('iconv-lite')

router.get('/:url', function (req, res, next) {
  const baseURL = process.env.SCHOOL_LEVEL === 'mavo'
      ? 'https://kiemmrooster.msa.nl'
      : 'https://mmlrooster.msa.nl';
  const url = `${baseURL}/${req.params.url}`
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
