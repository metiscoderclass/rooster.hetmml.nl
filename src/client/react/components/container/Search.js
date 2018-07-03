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


import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Search from '../presentational/Search';
import { setUser as setUserAction } from '../../store/actions';
import { userFromLocation } from '../../lib/url';
import users from '../../users';

const mapStateToProps = (state, { location }) => {
  const currentUser = userFromLocation(location);
  const searchText = state.search.text;
  const isExactMatch = currentUser != null && searchText === users.byId[currentUser].value;

  return {
    currentUser,
    isExactMatch,
    selectedUser: state.search.selected,
    results: state.search.results,
    searchText: state.search.text,
  };
};

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(setUserAction(user)),
  onInputChange: searchText => dispatch({
    type: 'SEARCH/INPUT_CHANGE',
    searchText,
  }),
  changeSelectedUser: relativeChange => dispatch({
    type: 'SEARCH/CHANGE_SELECTED_RESULT',
    relativeChange,
  }),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Search));
