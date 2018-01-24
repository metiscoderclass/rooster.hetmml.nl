import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Search from '../container/Search';
import View from '../container/View';
import users from '../../users';

const App = ({ match }) => {
  const user = `${match.params.type}/${match.params.value}`;

  if (!users.allIds.includes(user)) {
    // Invalid user, redirect to index.
    return <Redirect to="/" />;
  }

  return (
    <div className="page-user">
      <div className="menu">
        <div className="menu-container">
          <Search urlUser={user} />
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
};

export default App;
