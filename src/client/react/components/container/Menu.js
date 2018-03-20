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
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { Button, ButtonIcon } from 'rmwc/Button';
import { SimpleMenu, MenuItem } from 'rmwc/Menu';
import { Icon } from 'rmwc/Icon';

class Menu extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  render() {
    return (
      <SimpleMenu
        handle={<Button><ButtonIcon use="more_vert" /></Button>}
      >
        <MenuItem><Icon use="bookmark_border" />Voeg label toe</MenuItem>
        <MenuItem><Icon use="star_border" />Maak favoriet</MenuItem>
        <div className="mdc-list-divider" role="separator" />
        <MenuItem onClick={() => this.props.dispatch({ type: 'ROOM_FINDER/SHOW' })}><Icon use="location_searching" />Lokaal zoeken</MenuItem>
        <MenuItem><Icon use="launch" />Oud rooster gebruiken</MenuItem>
      </SimpleMenu>
    );
  }
}

export default connect()(Menu);
