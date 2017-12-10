import React from 'react';
import PropTypes from 'prop-types';

const Search = ({ onInputChange, value, results }) => (
  <div>
    <input
      onChange={onInputChange}
      value={value}
      placeholder="Zoeken"
    />
    <ul>
      {results.map(result => <li key={result.name}>{result.name}</li>)}
    </ul>
  </div>
);

Search.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.require,
    type: PropTypes.string.require,
  })).isRequired,
};

export default Search;
