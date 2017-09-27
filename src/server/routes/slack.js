const express = require('express')
const router = express.Router()

const getUserIndex = require('../lib/getUserIndex')

function generateResponse(query) {
  return getUserIndex().then(users => {
    const user =
      users.filter(user => user.value === query)[0]

    if (!user) {
      return {
        "response_type": "ephemeral",
        "mrkdwn": true,
        "text": `Sorry, I tried my best, but I couldn't find _${query}_`
      }
    }

    return {
      "response_type": "in_channel",
      "text": `Here is the schedule of _${query}_`,
      "mrkdwn": true,
      "attachments": [
        {
          "fallback": `https://beta.rooster.hetmml.nl/${user.type}/${user.value}`,
          "image_url": `https://beta.rooster.hetmml.nl/get/${user.type}/${user.value}.png`
        }
      ]
    }
  })
}

router.all('/', function (req, res, next) {
  const query = req.body.text || req.query.text

  if (query.indexOf('!') === 0) {
    switch (query) {
      case "!help":
        res.json({
          "response_type": "ephemeral",
          "mrkdwn": true,
          "text": "Here are some examples on how you can use me\n>/rooster 18561\n\n>/rooster akh\n\n>/rooster 6-5H2\n\n>/rooster 008-mk\n\nPlease note that the following does not work (yet)",
          "attachments": [{
            "text": "/rooster 5h2",
            "color": "danger"
          }]
        })
      default:
        res.json({
          "response_type": "ephemeral",
          "text": "Unrecognized command, try !help"
        })
        break;
    } 
  }

  generateResponse(query).then((json) => res.json(json))
})

module.exports = router
