import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import Search from '../container/Search';
import View from '../container/View';
import users from '../../users';
import WeekSelector from '../container/WeekSelector';

const App = ({ match, location }) => {
  const user = `${match.params.type}/${match.params.value}`;
  const weekStr = queryString.parse(location.search).week;
  const week = weekStr ? moment().week(weekStr) : moment();

  if (!users.allIds.includes(user)) {
    // Invalid user, redirect to index.
    return <Redirect to="/" />;
  }

  return (
    <div className="page-user">
      <div className="menu">
        <div className="menu-container">
          <Search urlUser={user} />
          <WeekSelector urlWeek={week} />
        </div>
      </div>
      <View user={user} />
    </div>
  );
};

App.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      type: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

export default App;
