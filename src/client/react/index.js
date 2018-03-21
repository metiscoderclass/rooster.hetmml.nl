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

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import reducer from './reducers';
import Index from './components/page/Index';
import User from './components/page/User';

import './index.scss';

moment.locale('nl');

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(logger)),
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route path="/:type/:value" component={User} />
        <Redirect to="/" />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root'),
);

// We only want to focus the input on page load. NOT on a in-javascript
// redirect. This is because that is when people usually want to start typing.
document.querySelector('.search input').focus();
