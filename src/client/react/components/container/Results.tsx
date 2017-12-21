import * as React from 'react';
import { connect } from 'react-redux';
import * as classnames from 'classnames';
import Result from '../presentational/Result';
import { User } from '../../users';
import { State } from '../../reducers';

const Results: React.StatelessComponent<{ results: string[], isExactMatch: boolean, selectedResult: string }> = (props) => (
  <div
    className={classnames('search__results', {
      'search__results--has-results': !props.isExactMatch && props.results.length > 0,
    })}
  >
    {!props.isExactMatch && props.results.map(userId => (
      <Result key={userId} userId={userId} isSelected={userId === props.selectedResult} />
    ))}
  </div>
);

const mapStateToProps = (state: State) => ({
  results: state.search.results,
  isExactMatch: state.search.isExactMatch,
  selectedResult: state.search.selectedResult,
});

export default connect(mapStateToProps)(Results);
