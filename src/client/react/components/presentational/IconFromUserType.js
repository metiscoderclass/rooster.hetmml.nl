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
