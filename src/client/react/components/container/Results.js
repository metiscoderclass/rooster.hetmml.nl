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

import './Results.scss';

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
    const {
      searchText,
      results,
      selectedResult,
      match,
      location,
      history,
      dispatch,
    } = this.props;
    const user = userFromMatch(match);

    const isExactMatch = (
      user != null && searchText === users.byId[user].value
    );

    return (
      <div
        className={classnames('Results', {
          hasResults: !isExactMatch && results.length > 0,
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
                dispatch({ type: 'SEARCH/SET_USER', user });
              } else {
                setUser(userId, location, history);
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
