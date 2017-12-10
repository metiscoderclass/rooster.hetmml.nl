import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SearchIcon from 'react-icons/lib/md/search';

const Search = ({
  onInputChange,
  onFocus,
  onBlur,
  hasFocus,
  value,
  results,
}) => (
  <div className={classnames('search', { focus: hasFocus })}>
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
    <ul>
      {results.map(result => <li key={result.name}>{result.name}</li>)}
    </ul>
  </div>
);

Search.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  hasFocus: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};

export default Search;
