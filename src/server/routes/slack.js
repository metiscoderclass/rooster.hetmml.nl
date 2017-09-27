const express = require('express')
const router = express.Router()

router.all('/', function (req, res, next) {
  res.json({
    "response_type": "in_channel",
    "text": "Here is the schedule of _18561_",
    "mrkdwn": true,
    "attachments": [
      {
        "fallback": `https://beta.rooster.hetmml.nl/s/${req.body.text}`,
        "image_url": `https://beta.rooster.hetmml.nl/get/s/${req.body.text}.png`
      }
    ]
  })
})

module.exports = router
