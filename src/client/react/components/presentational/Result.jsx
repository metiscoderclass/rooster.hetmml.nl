import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import IconFromUserType from './IconFromUserType';

const Result = ({ user, selected }) => (
  <div
    className={classnames('search__result', {
      'search__result--selected': selected,
    })}
  >
    <div className="search__icon-wrapper"><IconFromUserType userType={user.type} /></div>
    <div className="search__result__text">{user.value}</div>
  </div>
);

Result.propTypes = {
  user: PropTypes.shape({
    value: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
};

export default Result;
