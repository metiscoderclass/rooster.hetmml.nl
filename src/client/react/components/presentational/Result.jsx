import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import users from '../../users';

import IconFromUserType from './IconFromUserType';

const Result = ({ userId, isSelected }) => (
  <div
    className={classnames('search__result', {
      'search__result--selected': isSelected,
    })}
  >
    <div className="search__icon-wrapper"><IconFromUserType userType={users.byId[userId].type} /></div>
    <div className="search__result__text">{users.byId[userId].value}</div>
  </div>
);

Result.propTypes = {
  userId: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default Result;
