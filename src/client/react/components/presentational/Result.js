import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import users from '../../users';

import IconFromUserType from './IconFromUserType';

class Result extends React.Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    return (
      // eslint-disable-next-line
      <div
        className={classnames('search__result', {
          'search__result--selected': this.props.isSelected,
        })}
        onClick={this.props.onClick}
      >
        <div className="search__icon-wrapper">
          <IconFromUserType userType={users.byId[this.props.userId].type} />
        </div>
        <div className="search__result__text">{users.byId[this.props.userId].value}</div>
      </div>
    );
  }
}

export default Result;
