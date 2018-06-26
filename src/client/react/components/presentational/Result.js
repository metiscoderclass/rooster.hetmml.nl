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

import './Result.scss';

class Result extends React.Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    const { onClick, isSelected, userId } = this.props;

    return (
      /* eslint-disable jsx-a11y/click-events-have-key-events */
      /* eslint-disable jsx-a11y/no-static-element-interactions */
      <div
        className={classnames('Result', { isSelected })}
        onClick={onClick}
      >
        <div className="iconWrapper">
          <IconFromUserType userType={users.byId[userId].type} />
        </div>
        <div className="text">
          {users.byId[userId].value}
          {users.byId[userId].alt && (
            <span className="alt">
              {` ${users.byId[userId].alt}`}
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default Result;
