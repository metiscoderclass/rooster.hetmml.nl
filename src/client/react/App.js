import React from 'react';
import PropTypes from 'prop-types';

import {
  Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import { Provider } from 'react-redux';

import Index from './components/page/Index';
import User from './components/page/User';

export default class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  render() {
    const { store, history } = this.props;

    return (
      <Provider store={store}>
        <Router history={history}>
          <Switch>
            <Route exact path="/" component={Index} />
            <Route path="/:type/:value" component={User} />
            <Redirect to="/" />
          </Switch>
        </Router>
      </Provider>
    );
  }
}
