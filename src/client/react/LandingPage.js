import React from 'react';
import PropTypes from 'prop-types';
import Search from './components/container/Search';

const App = ({ location }) => (
  <div>
    <Search location={location} />
  </div>
);

App.propTypes = {
  location: PropTypes.object.isRequired,
};

export default App;
