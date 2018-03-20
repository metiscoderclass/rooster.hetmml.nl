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
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button, ButtonIcon } from 'rmwc/Button';
import users from '../../users';
import { userFromMatch } from '../../lib/url';

class HelpBox extends React.Component {
  static propTypes = {
    // redux
    isVisible: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,

    // react-router
    match: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.setRoom = this.setRoom.bind(this);
    this.changeRoom = this.changeRoom.bind(this);
  }

  componentWillMount() {
    const user = userFromMatch(this.props.match);
    // Have we just been mounted and are we viewing something else then a room?
    if (this.props.isVisible && users.byId[user].type !== 'r') {
      // Set the room to the first room.
      this.setRoom(this.getAllRooms()[0]);
    }
  }

  componentWillReceiveProps(nextProps) {
    const user = userFromMatch(nextProps.match);
    // We are not currently viewing a room, correct the situation.
    if (nextProps.isVisible && users.byId[user].type !== 'r') {
      // Did we just become visible? Set the user to a room. If not, hide.
      if (!this.props.isVisible) {
        // Set the room to the first room.
        this.setRoom(this.getAllRooms()[0], nextProps);
      } else {
        this.props.dispatch({ type: 'ROOM_FINDER/HIDE' });
      }
    }
  }

  getAllRooms() {
    return users.allUsers.filter(user => user.type === 'r').map(room => room.id);
  }

  setRoom(roomId, props = this.props) {
    const query = props.location.search;
    props.history.push(`/${roomId}${query}`);
  }

  changeRoom(change) {
    const currentRoom = userFromMatch(this.props.match);
    const allRooms = this.getAllRooms();
    const currentRoomIndex = allRooms.indexOf(currentRoom);
    let nextRoomIndex = currentRoomIndex + change;
    if (nextRoomIndex < 0) {
      nextRoomIndex = allRooms.length - 1;
    } else if (nextRoomIndex > allRooms.length - 1) {
      nextRoomIndex = 0;
    }

    const nextRoom = allRooms[nextRoomIndex];
    this.setRoom(nextRoom);
  }

  render() {
    if (!this.props.isVisible) {
      return <div />;
    }

    return (
      <div className="room-finder">
        <Button onClick={() => this.changeRoom(-1)}>Vorige</Button>
        <Button onClick={() => this.changeRoom(+1)}>Volgende</Button>
        <div className="grow" />
        <Button
          className="close-button"
          onClick={() => this.props.dispatch({ type: 'ROOM_FINDER/HIDE' })}
        >
          <ButtonIcon use="close" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isVisible: state.isRoomFinderVisible,
});

export default withRouter(connect(mapStateToProps)(HelpBox));
