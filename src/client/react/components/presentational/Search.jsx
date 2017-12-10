import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SearchIcon from 'react-icons/lib/md/search';
import StudentIcon from 'react-icons/lib/md/person';
import RoomIcon from 'react-icons/lib/md/room';
import ClassIcon from 'react-icons/lib/md/group';
import TeacherIcon from 'react-icons/lib/md/account-circle';

const userShape = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const IconFromUserType = ({ userType }) => {
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
      return <SearchIcon />;
  }
};

IconFromUserType.propTypes = {
  userType: PropTypes.string,
};

IconFromUserType.defaultProps = {
  userType: null,
};


const Result = ({ user }) => (
  <div className="search__result">
    <div className="search__icon-wrapper"><IconFromUserType userType={user.type} /></div>
    <div className="search__result__text">{user.value}</div>
  </div>
);

Result.propTypes = {
  user: PropTypes.shape(userShape).isRequired,
};

const Search = ({
  onInputChange,
  onFocus,
  onBlur,
  hasFocus,
  value,
  results,
  exactMatch,
}) => (
  <div className={classnames('search', { 'search--has-focus': hasFocus, 'search--has-results': results.length > 0 })}>
    <div className="search__input-wrapper">
      {/* Show the icon from the exact match if there is an exact match, otherwise show the search icon. */}
      <div className="search__icon-wrapper"><IconFromUserType userType={exactMatch ? exactMatch.type : null} /></div>
      <input
        onChange={onInputChange}
        value={value}
        placeholder="Zoeken"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
    {results.map(user => (
      <Result key={user.value} user={user} />
    ))}
  </div>
);

Search.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  hasFocus: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(PropTypes.shape(userShape)).isRequired,
  exactMatch: PropTypes.shape(userShape),
};

Search.defaultProps = {
  exactMatch: null,
};


export default Search;
