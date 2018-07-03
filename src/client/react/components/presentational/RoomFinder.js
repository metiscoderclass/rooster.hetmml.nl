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
import { Button, ButtonIcon } from 'rmwc/Button';
import users from '../../users';

import './RoomFinder.scss';

class RoomFinder extends React.Component {
  static propTypes = {
    // redux
    isVisible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,

    // react-router
    user: PropTypes.string.isRequired,
    shiftRoom: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { isVisible, user, onHide } = this.props;

    if (isVisible && users.byId[user].type !== 'r') {
      // We are not currently viewing a room, so just hide.
      onHide();
    }
  }

  render() {
    const { isVisible, shiftRoom, onHide } = this.props;
    if (!isVisible) {
      return <div />;
    }

    return (
      <div className="RoomFinder">
        <Button onClick={() => shiftRoom(-1)}>
          Vorige
        </Button>
        <Button onClick={() => shiftRoom(+1)}>
          Volgende
        </Button>
        <div className="grow" />
        <Button
          className="closeButton"
          onClick={onHide}
        >
          <ButtonIcon use="close" />
        </Button>
      </div>
    );
  }
}

export default RoomFinder;
