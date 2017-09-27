const express = require('express')
const router = express.Router()

router.all('/', function (req, res, next) {
  if (!/^[0-9]+$/.test(req.body.text)) {
    res.json({
      "response_type": "ephemeral",
      "text": "Only student id's are currently supported, more comming soon!"
    })
    return
  }
  res.json({
    "response_type": "in_channel",
    "text": `Here is the schedule of _${req.body.text}_`,
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
