import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Result from '../presentational/Result';

const Results = (({ results }) => (
  <div
    className={classnames('search__results', {
      'search__results--has-results': results.length > 0,
    })}
  >
    {results.map(user => (
      <Result key={user.value} user={user} />
    ))}
  </div>
));

Results.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.value,
  })).isRequired,
};

const mapStateToProps = state => ({
  results: state.search.results,
});

export default connect(mapStateToProps)(Results);
