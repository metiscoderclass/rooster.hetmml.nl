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
import { Redirect } from 'react-router-dom';
import { Elevation } from 'rmwc/Elevation';
import Search from '../container/Search';
import View from '../container/View';
import { userFromMatch } from '../../lib/url';
import WeekSelector from '../container/WeekSelector';
import RoomFinder from '../container/RoomFinder';

class UserPage extends React.Component {
  static propTypes = {
    // react-router
    match: PropTypes.object.isRequired,
  };

  render() {
    const user = userFromMatch(this.props.match);

    if (!user) {
      // Invalid user, redirect to index.
      return <Redirect to="/" />;
    }

    return (
      <div className="page-user">
        <div className="search-wrapper">
          <div className="search-container">
            <Search />
          </div>
        </div>
        <Elevation z={2}>
          <div className="menu">
            <div className="menu-container">
              <RoomFinder />
              <WeekSelector />
            </div>
          </div>
        </Elevation>
        <View />
      </div>
    );
  }
}

export default UserPage;
