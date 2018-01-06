import * as React from 'react';
import StudentIcon = require('react-icons/lib/md/person');
import RoomIcon = require('react-icons/lib/md/room');
import ClassIcon = require('react-icons/lib/md/group');
import TeacherIcon = require('react-icons/lib/md/account-circle');

// interface IconFromUserTypeProps {
//   userType: string,
//   defaultIcon?: JSX.Element,
// }

const IconFromUserType: React.StatelessComponent<{ userType: string, defaultIcon?: JSX.Element }> = (props) => {
  switch (props.userType) {
    case 'c':
      return <ClassIcon />;
    case 't':
      return <TeacherIcon />;
    case 's':
      return <StudentIcon />;
    case 'r':
      return <RoomIcon />;
    default:
      if (props.defaultIcon) {
        return props.defaultIcon;
      }

      throw new Error('`userType` was invalid or not given, but `defaultIcon` is not defined.');
  }
};

export default IconFromUserType;
