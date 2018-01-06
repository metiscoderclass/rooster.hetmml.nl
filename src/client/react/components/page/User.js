import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Search from '../container/Search';
import users from '../../users';

const App = ({ match }) => {
  const user = `${match.params.type}/${match.params.value}`;

  if (!users.allIds.includes(user)) {
    // Invalid user, redirect to index.
    return <Redirect to="/" />;
  }

  return (
    <div>
      <Search urlUser={user} />
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
