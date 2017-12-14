import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Result from '../presentational/Result';

const Results = (({ results, isExactMatch, selectedResult }) => (
  <div
    className={classnames('search__results', {
      'search__results--has-results': !isExactMatch && results.length > 0,
    })}
  >
    {!isExactMatch && results.map(userId => (
      <Result key={userId} userId={userId} isSelected={userId === selectedResult} />
    ))}
  </div>
));

Results.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
  isExactMatch: PropTypes.bool.isRequired,
  selectedResult: PropTypes.string,
};

Results.defaultProps = {
  selectedResult: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  isExactMatch: state.search.isExactMatch,
  selectedResult: state.search.selectedResult,
});

export default connect(mapStateToProps)(Results);
