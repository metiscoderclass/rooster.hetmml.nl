import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

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
        <ConnectedRouter history={history}>
          <AppRouter />
        </ConnectedRouter>
      </Provider>
    );
  }
}
