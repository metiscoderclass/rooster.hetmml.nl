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
import { makeSetUser, userFromMatch } from '../../lib/url';

import './RoomFinder.scss';

class RoomFinder extends React.Component {
  static propTypes = {
    // redux
    isVisible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,

    // react-router
    user: PropTypes.string.isRequired,
    setUser: PropTypes.func.isRequired,
  }

  componentWillMount() {
    const { isVisible, user, onHide } = this.props;

    if (isVisible && users.byId[user].type !== 'r') {
      // We are not currently viewing a room, so just hide.
      onHide();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isVisible, user, onHide } = nextProps;

    if (isVisible && users.byId[user].type !== 'r') {
      // We are not currently viewing a room, so just hide.
      onHide();
    }
  }

  changeRoom(change) {
    const { user, setUser } = this.props;
    const { allRoomIds } = users;

    const currentRoom = user;
    const currentRoomIndex = allRoomIds.indexOf(currentRoom);
    let nextRoomIndex = currentRoomIndex + change;
    if (nextRoomIndex < 0) {
      nextRoomIndex = allRoomIds.length - 1;
    } else if (nextRoomIndex > allRoomIds.length - 1) {
      nextRoomIndex = 0;
    }

    const nextRoom = allRoomIds[nextRoomIndex];
    setUser(nextRoom);
  }

  render() {
    const { isVisible, onHide } = this.props;
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
          onClick={onHide}
        >
          <ButtonIcon use="close" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state, { match }) => ({
  user: userFromMatch(match),
  isVisible: state.isRoomFinderVisible,
});

const mapDispatchToProps = (dispatch, { location, history }) => ({
  setUser: makeSetUser(location, history),
  onHide: () => dispatch({ type: 'ROOM_FINDER/HIDE' }),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomFinder));
