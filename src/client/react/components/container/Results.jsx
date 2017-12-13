import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Result from '../presentational/Result';

const Results = (({ results, selectedResult }) => (
  <div
    className={classnames('search__results', {
      'search__results--has-results': results.length > 0,
    })}
  >
    {results.map(user => (
      <Result key={user.value} user={user} selected={user === selectedResult} />
    ))}
  </div>
));

Results.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  selectedResult: PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string,
  }),
};

Results.defaultProps = {
  selectedResult: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  selectedResult: state.search.selectedResult,
});

export default connect(mapStateToProps)(Results);
