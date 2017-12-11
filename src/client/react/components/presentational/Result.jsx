import React from 'react';
import PropTypes from 'prop-types';

import IconFromUserType from './IconFromUserType';

const Result = ({ user }) => (
  <div className="search__result">
    <div className="search__icon-wrapper"><IconFromUserType userType={user.type} /></div>
    <div className="search__result__text">{user.value}</div>
  </div>
);

Result.propTypes = {
  user: PropTypes.shape({
    value: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

export default Result;
