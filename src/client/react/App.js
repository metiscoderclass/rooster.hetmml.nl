import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import AppRouter from './AppRouter';

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
          <AppRouter />
        </Router>
      </Provider>
    );
  }
}
