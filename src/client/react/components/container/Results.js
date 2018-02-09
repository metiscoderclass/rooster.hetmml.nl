import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import users from '../../users';
import { setUser } from '../../actions/search';
import { userFromMatch } from '../../lib/url';
import Result from '../presentational/Result';

class Results extends React.Component {
  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.string).isRequired,
    searchText: PropTypes.string.isRequired,
    selectedResult: PropTypes.string,

    // react-router
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,

    // redux
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    selectedResult: null,
  };

  render() {
    const user = userFromMatch(this.props.match);

    const isExactMatch =
      user != null &&
      this.props.searchText === users.byId[user].value;

    return (
      <div
        className={classnames('search__results', {
          'search__results--has-results': !isExactMatch && this.props.results.length > 0,
        })}
        style={{
          minHeight: isExactMatch ? 0 : this.props.results.length * 54,
        }}
      >
        {!isExactMatch && this.props.results.map(userId => (
          <Result
            key={userId}
            userId={userId}
            isSelected={userId === this.props.selectedResult}
            onClick={() => {
              if (userId === user) {
                // EDGE CASE: The user is set if the user changes, but it doesn't
                // change if the result is already the one we are viewing.
                // Therefor, we need to dispatch the SET_USER command manually.
                this.props.dispatch(setUser(user));
              } else {
                this.props.history.push(`/${userId}`);
              }
            }}
          />
        ))}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  results: state.search.results,
  searchText: state.search.searchText,
  selectedResult: state.search.selectedResult,
});

export default withRouter(connect(mapStateToProps)(Results));
