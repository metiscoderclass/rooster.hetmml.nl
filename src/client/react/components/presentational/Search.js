import React from 'react';
import PropTypes from 'prop-types';

const Search = ({ onType, value, results }) => (
  <div>
    <input
      onChange={onType}
      value={value}
      placeholder="Zoeken"
    />
    <ul>
      {results.map(result => <li key={result.name}>{result.name}</li>)}
    </ul>
  </div>
);

Search.propTypes = {
  onType: PropTypes.func.isRequired,
  value: PropTypes.func.isRequired,
  results: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.require,
    type: PropTypes.string.require,
  })).isRequired,
};

export default Search;
