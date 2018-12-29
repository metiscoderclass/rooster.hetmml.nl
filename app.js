const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const compression = require('compression')

const routes = require('./routes/index')
const meetingpointProxy = require('./routes/meetingpointProxy')
const hello = require('./routes/hello')

const app = express()

app.use(compression())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
if (process.env.SCHOOL === 'kiemm') {
  app.use(express.static(path.join(__dirname, 'public-kiemm')))
} else {
  app.use(express.static(path.join(__dirname, 'public-metis')))
}

app.use('/', routes)
app.use('/meetingpointProxy', meetingpointProxy)
app.use('/hello', hello)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
