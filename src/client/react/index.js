import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import reducer from './reducers';
import Index from './components/page/Index';
import User from './components/page/User';

moment.locale('nl');

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunk, logger)),
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
