import React from 'react';

import {
  withRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';

import Index from './components/page/Index';
import User from './components/page/User';
import { setUser } from './store/actions';
import { userFromLocation } from './lib/url';

class AppRouter extends React.Component {
  static propTypes = {
    user: PropTypes.string,
    resetUserState: PropTypes.func.isRequired,
  }

  static defaultProps = {
    user: null,
  }

  componentDidMount() {
    const { user, resetUserState } = this.props;

    resetUserState(user);
  }

  render() {
    return (
      <Switch>
        <Route exact path="/" component={Index} />
        <Route path="/:type/:value" component={User} />
        <Redirect to="/" />
      </Switch>
    );
  }
}

const mapStateToProps = (state, { location }) => {
  return {
    key: location.pathname,
    user: userFromLocation(location),
  };
};

const mapDispatchToProps = dispatch => ({
  resetUserState: user => dispatch(setUser(user)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppRouter));
