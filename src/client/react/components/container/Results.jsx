import React from 'react';
import { connect } from 'react-redux';
import Result from '../presentational/Result';

const Results = (({ results }) => (
  results.map(user => (
    <Result key={user.value} user={user} />
  ))
));

const mapStateToProps = state => ({
  results: state.search.results,
});

export default connect(mapStateToProps)(Results);
