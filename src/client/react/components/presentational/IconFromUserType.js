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
import StudentIcon from 'react-icons/lib/md/person';
import RoomIcon from 'react-icons/lib/md/room';
import ClassIcon from 'react-icons/lib/md/group';
import TeacherIcon from 'react-icons/lib/md/account-circle';

class IconFromUserType extends React.Component {
  static propTypes = {
    userType: PropTypes.string,
    defaultIcon: PropTypes.element,
  };

  static defaultProps = {
    userType: null,
    defaultIcon: null,
  };

  render() {
    switch (this.props.userType) {
      case 'c':
        return <ClassIcon />;
      case 't':
        return <TeacherIcon />;
      case 's':
        return <StudentIcon />;
      case 'r':
        return <RoomIcon />;
      default:
        if (this.props.defaultIcon) {
          return this.props.defaultIcon;
        }

        throw new Error('`userType` was invalid or not given, but `defaultIcon` is not defined.');
    }
  }
}

export default IconFromUserType;
