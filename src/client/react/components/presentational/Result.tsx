import * as React from 'react';
import * as classnames from 'classnames';
import users from '../../users';

import IconFromUserType from './IconFromUserType';

const Result: React.StatelessComponent<{ userId: string, isSelected: boolean }> = ({ userId, isSelected }) => (
  <div
    className={classnames('search__result', {
      'search__result--selected': isSelected,
    })}
  >
    <div className="search__icon-wrapper"><IconFromUserType userType={users.byId[userId].type} /></div>
    <div className="search__result__text">{users.byId[userId].value}</div>
  </div>
);

export default Result;
