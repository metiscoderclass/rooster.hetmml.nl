import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Search from '../container/Search';
import View from '../container/View';
import { userFromMatch } from '../../lib/url';
import WeekSelector from '../container/WeekSelector';

const UserPage = ({ match }) => {
  const user = userFromMatch(match);

  if (!user) {
    // Invalid user, redirect to index.
    return <Redirect to="/" />;
  }

  return (
    <div className="page-user">
      <div className="search-wrapper">
        <div className="search-container">
          <Search />
        </div>
      </div>
      <div className="menu">
        <div className="menu-container">
          <WeekSelector />
        </div>
      </div>
      <View />
    </div>
  );
};

UserPage.propTypes = {
  // react-router
  match: PropTypes.object.isRequired,
};

export default UserPage;
