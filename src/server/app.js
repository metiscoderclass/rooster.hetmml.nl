/**
 * Copyright (C) 2018 Noah Loomans
 *
 * This file is part of rooster.hetmml.nl.
 *
 * rooster.hetmml.nl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rooster.hetmml.nl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with rooster.hetmml.nl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const handlebars = require('express-handlebars');

const index = require('./routes/index');
const getSchedule = require('./routes/getSchedule');

const app = express();

app.use(compression());

// view engine setup
app.engine('handlebars', handlebars({
  partialsDir: path.join(__dirname, '../client/views/partials'),
}));
app.set('views', path.join(__dirname, '../client/views'));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '../client/static')));

app.use('/', index);
app.use('/get', getSchedule);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

function extractStatusCodeFromError(error) {
  if (error.status) {
    return error.status;
  } else if (error.response) {
    return error.response.status;
  }

  return null;
}

// error handler
app.use((error, req, res, next) => {
  const errorCode = extractStatusCodeFromError(error) || 500;
  res.status(errorCode);

  res.render('error', {
    message: error.message,
    error,
  });

  if (error === 500) {
    next(error);
  }
});

module.exports = app;
