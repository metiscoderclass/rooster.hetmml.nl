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
import { setUser, userFromMatch } from '../../lib/url';

class HelpBox extends React.Component {
  static propTypes = {
    // redux
    isVisible: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,

    // react-router
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.changeRoom = this.changeRoom.bind(this);
  }

  componentWillMount() {
    const user = userFromMatch(this.props.match);
    // Have we just been mounted and are we viewing something else then a room?
    if (this.props.isVisible && users.byId[user].type !== 'r') {
      this.props.dispatch({ type: 'ROOM_FINDER/HIDE' });
    }
  }

  componentWillReceiveProps(nextProps) {
    const user = userFromMatch(nextProps.match);
    // We are not currently viewing a room, correct the situation.
    if (nextProps.isVisible && users.byId[user].type !== 'r') {
      // Did we just become visible? Set the user to a room. If not, hide.
      if (!this.props.isVisible) {
        // Set the room to the first room.
        setUser(users.allRoomIds[0], nextProps.location, nextProps.history);
      } else {
        this.props.dispatch({ type: 'ROOM_FINDER/HIDE' });
      }
    }
  }

  changeRoom(change) {
    const { allRoomIds } = users;
    const currentRoom = userFromMatch(this.props.match);
    const currentRoomIndex = allRoomIds.indexOf(currentRoom);
    let nextRoomIndex = currentRoomIndex + change;
    if (nextRoomIndex < 0) {
      nextRoomIndex = allRoomIds.length - 1;
    } else if (nextRoomIndex > allRoomIds.length - 1) {
      nextRoomIndex = 0;
    }

    const nextRoom = allRoomIds[nextRoomIndex];
    setUser(nextRoom, this.props.location, this.props.history);
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
