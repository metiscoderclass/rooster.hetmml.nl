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
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';

import SearchIcon from 'react-icons/lib/md/search';

import { setUser, userFromMatch } from '../../lib/url';

import users from '../../users';
import Menu from './Menu';
import Results from './Results';
import IconFromUserType from '../presentational/IconFromUserType';

import './Search.scss';

class Search extends React.Component {
  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedResult: PropTypes.string,
    searchText: PropTypes.string.isRequired,

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

  constructor(props) {
    super(props);

    this.state = {
      hasFocus: false,
    };

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  componentDidMount() {
    const urlUser = userFromMatch(this.props.match);
    this.props.dispatch({ type: 'SEARCH/SET_USER', user: urlUser });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match !== this.props.match) {
      const urlUser = userFromMatch(nextProps.match);
      this.props.dispatch({ type: 'SEARCH/SET_USER', user: urlUser });
    }
  }

  onFocus() {
    this.setState({
      hasFocus: true,
    });
  }

  onBlur() {
    this.setState({
      hasFocus: false,
    });
  }

  onKeyDown(event) {
    const urlUser = userFromMatch(this.props.match);
    const result = this.props.selectedResult || this.props.results[0];

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.props.dispatch({ type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 });
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.props.dispatch({ type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 });
        break;

      case 'Escape':
        event.preventDefault();
        this.props.dispatch({ type: 'SEARCH/SET_USER', user: urlUser });
        break;

      case 'Enter':
        event.preventDefault();
        if (result === urlUser) {
          // EDGE CASE: The user is set if the user changes, but it doesn't
          // change if the result is already the one we are viewing.
          // Therefor, we need to dispatch the SET_USER command manually.
          this.props.dispatch({ type: 'SEARCH/SET_USER', user: urlUser });
        } else if (result) {
          setUser(result, this.props.location, this.props.history);
        }
        break;

      default:
        // Do nothing
    }
  }

  render() {
    const {
      searchText,
      match,
      dispatch,
    } = this.props;

    const {
      hasFocus,
    } = this.state;

    const urlUser = userFromMatch(match);

    const isExactMatch =
      urlUser != null &&
      searchText === users.byId[urlUser].value;

    return (
      <div className="Search">
        <div className={classnames('overflow', { hasFocus })}>
          <div className="inputWrapper">
            <div className="iconWrapper">
              <IconFromUserType
                userType={isExactMatch ? users.byId[urlUser].type : null}
                defaultIcon={<SearchIcon />}
              />
            </div>
            <input
              id="search__input"
              onChange={event => dispatch({ type: 'SEARCH/INPUT_CHANGE', searchText: event.target.value })}
              onKeyDown={this.onKeyDown}
              value={searchText}
              placeholder="Zoeken"
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              autoComplete="off"
            />
            <Menu />
          </div>
          <Results />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  results: state.search.results,
  searchText: state.search.text,
  selectedResult: state.search.selected,
});

export default withRouter(connect(mapStateToProps)(Search));
