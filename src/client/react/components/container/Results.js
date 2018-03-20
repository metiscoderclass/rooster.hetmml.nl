/**
 * Copyright (C) 2018 Noah Loomans
 *
 * This file is part of rooster.hetmml.nl.
 *
 * rooster.hetmml.nl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rooster.hetmml.nl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with rooster.hetmml.nl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import users from '../../users';
import { setUser, userFromMatch } from '../../lib/url';
import Result from '../presentational/Result';

class Results extends React.Component {
  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.string).isRequired,
    searchText: PropTypes.string.isRequired,
    selectedResult: PropTypes.string,

    // react-router
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
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
                this.props.dispatch({ type: 'SEARCH/SET_USER', user });
              } else {
                setUser(userId, this.props.location, this.props.history);
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
  searchText: state.search.text,
  selectedResult: state.search.result,
});

export default withRouter(connect(mapStateToProps)(Results));
