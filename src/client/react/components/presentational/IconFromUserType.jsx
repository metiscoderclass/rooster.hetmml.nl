import React from 'react';
import PropTypes from 'prop-types';
import StudentIcon from 'react-icons/lib/md/person';
import RoomIcon from 'react-icons/lib/md/room';
import ClassIcon from 'react-icons/lib/md/group';
import TeacherIcon from 'react-icons/lib/md/account-circle';

const IconFromUserType = ({ userType, defaultIcon }) => {
  switch (userType) {
    case 'c':
      return <ClassIcon />;
    case 't':
      return <TeacherIcon />;
    case 's':
      return <StudentIcon />;
    case 'r':
      return <RoomIcon />;
    default:
      if (defaultIcon) {
        return defaultIcon;
      }

      throw new Error('`userType` was invalid or not given, but `defaultIcon` is not defined.');
  }
};

IconFromUserType.propTypes = {
  userType: PropTypes.string,
  defaultIcon: PropTypes.react,
};

IconFromUserType.defaultProps = {
  userType: null,
  defaultIcon: null,
};

export default IconFromUserType;
