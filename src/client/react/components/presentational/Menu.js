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
import { PropTypes } from 'prop-types';
import { Button, ButtonIcon } from 'rmwc/Button';
import { SimpleMenu, MenuItem } from 'rmwc/Menu';
import { Icon } from 'rmwc/Icon';
import users from '../../users';

import './Menu.scss';

class Menu extends React.Component {
  static propTypes = {
    user: PropTypes.string,
    setUser: PropTypes.func.isRequired,
    showRoomFinder: PropTypes.func.isRequired,
  }

  static defaultProps = {
    user: null,
  }

  onItemSelected(index) {
    switch (index) {
      case 'room_finder': {
        const { setUser, user, showRoomFinder } = this.props;

        if (user == null || users.byId[user].type !== 'r') {
          // We are not currently viewing a room, correct the situation.
          setUser(users.allRoomIds[0]);
        }

        showRoomFinder();
        break;
      }
      default:
        // No default
    }
  }

  render() {
    return (
      <div className="Menu">
        <SimpleMenu
          handle={(
            <Button>
              <ButtonIcon use="more_vert" />
            </Button>
          )}
          onSelected={(event) => {
            // Send the `data-type` of the selected <MenuItem />
            this.onItemSelected(event.detail.item.dataset.type);
          }}
        >
          <MenuItem data-type="add_label">
            <Icon use="bookmark_border" />
            Voeg label toe
          </MenuItem>
          <MenuItem data-type="make_favorite">
            <Icon use="star_border" />
            Maak favoriet
          </MenuItem>
          <div className="mdc-list-divider" role="separator" />
          <MenuItem data-type="room_finder">
            <Icon use="location_searching" />
            Lokaal zoeken
          </MenuItem>
          <MenuItem data-type="use_legacy_schedule">
            <Icon use="launch" />
            Oud rooster gebruiken
          </MenuItem>
        </SimpleMenu>
      </div>
    );
  }
}

export default Menu;
