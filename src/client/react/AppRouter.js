import React from 'react';

import {
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import Index from './components/page/Index';
import User from './components/page/User';

class AppRouter extends React.Component {
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

export default AppRouter;
