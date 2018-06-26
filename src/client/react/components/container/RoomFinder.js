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

import './RoomFinder.scss';

class RoomFinder extends React.Component {
  static propTypes = {
    // redux
    isVisible: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,

    // react-router
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  componentWillMount() {
    const { isVisible, match, dispatch } = this.props;
    const user = userFromMatch(match);

    if (isVisible && users.byId[user].type !== 'r') {
      // We are not currently viewing a room, so just hide.
      dispatch({ type: 'ROOM_FINDER/HIDE' });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isVisible, match, dispatch } = nextProps;

    const user = userFromMatch(match);
    if (isVisible && users.byId[user].type !== 'r') {
      // We are not currently viewing a room, so just hide.
      dispatch({ type: 'ROOM_FINDER/HIDE' });
    }
  }

  changeRoom(change) {
    const { match, location, history } = this.props;
    const { allRoomIds } = users;
    const currentRoom = userFromMatch(match);
    const currentRoomIndex = allRoomIds.indexOf(currentRoom);
    let nextRoomIndex = currentRoomIndex + change;
    if (nextRoomIndex < 0) {
      nextRoomIndex = allRoomIds.length - 1;
    } else if (nextRoomIndex > allRoomIds.length - 1) {
      nextRoomIndex = 0;
    }

    const nextRoom = allRoomIds[nextRoomIndex];
    setUser(nextRoom, location, history);
  }

  render() {
    const { isVisible, dispatch } = this.props;
    if (!isVisible) {
      return <div />;
    }

    return (
      <div className="RoomFinder">
        <Button onClick={() => this.changeRoom(-1)}>
          Vorige
        </Button>
        <Button onClick={() => this.changeRoom(+1)}>
          Volgende
        </Button>
        <div className="grow" />
        <Button
          className="closeButton"
          onClick={() => dispatch({ type: 'ROOM_FINDER/HIDE' })}
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

export default withRouter(connect(mapStateToProps)(RoomFinder));
