/**
 * Copyright (C) 2018 Noah Loomans
 *
 * This file is part of rooster.hetmml.nl.
 *
 * rooster.hetmml.nl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rooster.hetmml.nl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with rooster.hetmml.nl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
        <div className="search__result__text">
          {users.byId[this.props.userId].value}
          {users.byId[this.props.userId].alt &&
            <span className="search__result__text__alt">
              {` ${users.byId[this.props.userId].alt}`}
            </span>
          }
        </div>
      </div>
    );
  }
}

export default Result;
