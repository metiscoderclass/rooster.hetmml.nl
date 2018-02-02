import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setUser } from '../../actions/search';
import { userFromMatch } from '../../lib/url';
import Result from '../presentational/Result';

const Results = ({
  results,
  isExactMatch,
  selectedResult,
  match,
  history,
  dispatch,
}) => {
  const user = userFromMatch(match);

  return (
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
            if (userId === user) {
              // EDGE CASE: The user is set if the user changes, but it doesn't
              // change if the result is already the one we are viewing.
              // Therefor, we need to dispatch the SET_USER command manually.
              dispatch(setUser(user));
            } else {
              history.push(`/${userId}`);
            }
          }}
        />
      ))}
    </div>
  );
};

Results.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
  isExactMatch: PropTypes.bool.isRequired,
  selectedResult: PropTypes.string,

  // react-router
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,

  // redux
  dispatch: PropTypes.func.isRequired,
};

Results.defaultProps = {
  selectedResult: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  isExactMatch: state.search.isExactMatch,
  selectedResult: state.search.selectedResult,
});

export default withRouter(connect(mapStateToProps)(Results));
