const express = require('express')
const router = express.Router()

const getUserIndex = require('../lib/getUserIndex')

router.all('/', function (req, res, next) {
  getUserIndex().then(users => {
    const query = req.body.text
    const user =
      users.filter(user => user.value === query)[0]

    if (!user) {
      res.json({
        "response_type": "ephemeral",
        "mrkdwn": true,
        "text": `Sorry, I tried my best, but I couldn't find _${query}_`
      })
      return
    }

    res.json({
      "response_type": "in_channel",
      "text": `Here is the schedule of _${query}_`,
      "mrkdwn": true,
      "attachments": [
        {
          "fallback": `https://beta.rooster.hetmml.nl/${user.type}/${user.value}`,
          "image_url": `https://beta.rooster.hetmml.nl/get/${user.type}/${user.value}.png`
        }
      ]
    })
  })
})

module.exports = router
