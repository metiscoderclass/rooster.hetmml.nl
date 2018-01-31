import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';
import Result from '../presentational/Result';
import { setUser } from '../../actions/search';

const Results = ({
  results,
  isExactMatch,
  urlUser,
  selectedResult,
  history,
  dispatch,
}) => (
  <div
    className={classnames('search__results', {
      'search__results--has-results': !isExactMatch && results.length > 0,
    })}
    style={{
      minHeight: isExactMatch ? 0 : results.length * 54,
    }}
  >
    {!isExactMatch && results.map(userId => (
      <Result
        key={userId}
        userId={userId}
        isSelected={userId === selectedResult}
        onClick={() => {
          if (userId === urlUser) {
            // EDGE CASE: The user is set if the user changes, but it doesn't
            // change if the result is already the one we are viewing.
            // Therefor, we need to dispatch the SET_USER command manually.
            dispatch(setUser(urlUser));
          } else {
            history.push(`/${userId}`);
          }
        }}
      />
    ))}
  </div>
);

Results.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
  isExactMatch: PropTypes.bool.isRequired,
  urlUser: PropTypes.string,
  selectedResult: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

Results.defaultProps = {
  urlUser: null,
  selectedResult: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  isExactMatch: state.search.isExactMatch,
  selectedResult: state.search.selectedResult,
});

export default withRouter(connect(mapStateToProps)(Results));
