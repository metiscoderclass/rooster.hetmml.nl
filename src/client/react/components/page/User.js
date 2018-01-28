import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import purifyWeek from '../../lib/purifyWeek';
import Search from '../container/Search';
import View from '../container/View';
import users from '../../users';
import WeekSelector from '../container/WeekSelector';

const UserPage = ({ match, location }) => {
  const user = `${match.params.type}/${match.params.value}`;
  const weekStr = queryString.parse(location.search).week;
  const week = purifyWeek(weekStr ? parseInt(weekStr, 10) : moment().week());

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
      <View user={user} week={week} />
    </div>
  );
};

UserPage.propTypes = {
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

export default UserPage;
