import React from 'react';
import PropTypes from 'prop-types';
import Search from '../container/Search';

const App = ({ location }) => (
  <div>
    <Search location={location} />
  </div>
);

App.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object.isRequired,
};

export default App;
