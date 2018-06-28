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

import { userFromMatch } from '../../lib/url';
import { setUser as setUserAction } from '../../store/actions';

import users from '../../users';
import Menu from './Menu';
import Results from './Results';
import IconFromUserType from '../presentational/IconFromUserType';

import './Search.scss';

class Search extends React.Component {
  static propTypes = {
    selectedResult: PropTypes.string,
    searchText: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    setUser: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    changeSelectedResult: PropTypes.func.isRequired,
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
    const {
      selectedResult,
      match,
      setUser,
      changeSelectedResult,
    } = this.props;

    const urlUser = userFromMatch(match);

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        changeSelectedResult(-1);
        break;

      case 'ArrowDown':
        event.preventDefault();
        changeSelectedResult(+1);
        break;

      case 'Escape':
        event.preventDefault();
        setUser(urlUser);
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedResult) {
          setUser(selectedResult);
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
      onInputChange,
    } = this.props;

    const {
      hasFocus,
    } = this.state;

    const urlUser = userFromMatch(match);

    const isExactMatch = (
      urlUser != null && searchText === users.byId[urlUser].value
    );

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
              id="searchInput"
              onChange={event => onInputChange(event.target.value)}
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

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(setUserAction(user)),
  onInputChange: searchText => dispatch({
    type: 'SEARCH/INPUT_CHANGE',
    searchText,
  }),
  changeSelectedResult: relativeChange => dispatch({
    type: 'SEARCH/CHANGE_SELECTED_RESULT',
    relativeChange,
  }),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Search));
