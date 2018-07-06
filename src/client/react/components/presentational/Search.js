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

import SearchIcon from 'react-icons/lib/md/search';

import users from '../../users';
import Menu from '../container/Menu';
import Results from '../container/Results';
import IconFromUserType from './IconFromUserType';

import './Search.scss';

class Search extends React.Component {
  static propTypes = {
    currentUser: PropTypes.string,
    selectedUser: PropTypes.string,
    searchText: PropTypes.string.isRequired,
    isExactMatch: PropTypes.bool.isRequired,

    setUser: PropTypes.func.isRequired,
    changeInput: PropTypes.func.isRequired,
    changeSelectedUser: PropTypes.func.isRequired,
  };

  static defaultProps = {
    currentUser: null,
    selectedUser: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      hasFocus: false,
    };
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

  handleKeyDown(event) {
    const {
      currentUser,
      selectedUser,
      setUser,
      changeSelectedUser,
    } = this.props;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        changeSelectedUser(-1);
        break;

      case 'ArrowDown':
        event.preventDefault();
        changeSelectedUser(+1);
        break;

      case 'Escape':
        event.preventDefault();
        setUser(currentUser);
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedUser) {
          setUser(selectedUser);
        }
        break;

      default:
        // Do nothing
    }
  }

  render() {
    const {
      searchText,
      currentUser,
      isExactMatch,
      changeInput,
    } = this.props;

    const {
      hasFocus,
    } = this.state;

    return (
      <div className="Search">
        <div className={classnames('overflow', { hasFocus })}>
          <div className="inputWrapper">
            <div className="iconWrapper">
              <IconFromUserType
                userType={isExactMatch ? users.byId[currentUser].type : null}
                defaultIcon={<SearchIcon />}
              />
            </div>
            <input
              id="searchInput"
              onChange={event => changeInput(event.target.value)}
              onKeyDown={event => this.handleKeyDown(event)}
              value={searchText}
              placeholder="Zoeken"
              onFocus={() => this.onFocus()}
              onBlur={() => this.onBlur()}
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

export default Search;
