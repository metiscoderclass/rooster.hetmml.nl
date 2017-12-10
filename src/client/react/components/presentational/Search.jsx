import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SearchIcon from 'react-icons/lib/md/search';
import PersonIcon from 'react-icons/lib/md/person';

const userShape = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const Result = ({ user }) => (
  <div className="search__result">
    <div className="search__icon-wrapper"><PersonIcon /></div>
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
}) => (
  <div className={classnames('search', { 'search--has-focus': hasFocus, 'search--has-results': results.length > 0 })}>
    <div className="search__input-wrapper">
      <div className="search__icon-wrapper"><SearchIcon /></div>
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
};

export default Search;
