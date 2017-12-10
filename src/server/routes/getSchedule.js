const express = require('express')
const router = express.Router()
const request = require('request')
const iconv = require('iconv-lite')
const webshot = require('webshot')

const getUserIndex = require('../lib/getUserIndex')
const getURLOfUser = require('../lib/getURLOfUser')

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
function getWeekNumber (target) {
  const dayNr = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }

  return 1 + Math.ceil((firstThursday - target) / 604800000)
}


router.get('/:type/:value.png', function (req, res, next) {
  port = process.env.PORT || 3000;
  const { type, value } = req.params
  const stream = webshot(
    `http://localhost:${port}/get/${type}/${value}`,
    { customCSS: "body { background-color: white; }" }
  )
  stream.pipe(res)
})

router.get('/:type/:value.jpg', function (req, res, next) {
  port = process.env.PORT || 3000;
  const { type, value } = req.params
  const stream = webshot(
    `http://localhost:${port}/get/${type}/${value}`,
    { customCSS: "body { background-color: white; }", streamType: 'jpg' }
  )
  stream.pipe(res)
})

router.get('/:type/:value', function (req, res, next) {
  getUserIndex().then(users => {
    const { type, value } = req.params
    let { week } = req.query
    const user =
      users.filter(user => user.type === type && user.value === value)[0]


    if (!user) {
      next(new Error(`${type}${value} is not in the user index.`))
    }

    if (!week) {
      week = getWeekNumber(new Date())
    }

    const { index } = user

    const url = getURLOfUser(type, index, week)

    request(url, { encoding: null }, function (err, data) {
      if (err) {
        next(err)
        return
      }




      let utf8Body = iconv.decode(data.body, 'ISO-8859-1')


          users.forEach(function (user) {
              let user_list = user.value;
              //let user_lijst_twee = user;
              let opties = {
                "leraar": "t",
                "klas": "c",
                "leerling": "s",
                "lokaal": "r"
              };


              user_list = new RegExp(user_list, 'g')


              let show_user_display = user_list.toString().replace(/[&\/\\#,+()$~%.'":g*?<>{}]/g,"");


              utf8Body = utf8Body.replace(user_list, "<a href='/" + optie + user_list + "'>" + show_user_display + "</a>")
              console.log(show_user_display);


    })



      res.status(data.statusCode).end(utf8Body)
    })
  })
})

module.exports = router
