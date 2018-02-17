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

/* global USERS */

import { combineReducers, createStore } from 'redux';

const getId = ({ type, value }) => `${type}/${value}`;

const byId = (state = {}, action) => {
  switch (action.type) {
    case 'USERS/ADD_USER':
      return {
        ...state,
        [action.user.id]: {
          ...action.user,
        },
      };
    default:
      return state;
  }
};

const allIds = (state = [], action) => {
  switch (action.type) {
    case 'USERS/ADD_USER':
      return [
        ...state,
        action.user.id,
      ];
    default:
      return state;
  }
};

const allUsers = (state = [], action) => {
  switch (action.type) {
    case 'USERS/ADD_USER':
      return [
        ...state,
        {
          ...action.user,
        },
      ];
    default:
      return state;
  }
};

const store = createStore(combineReducers({
  byId,
  allIds,
  allUsers,
}));

USERS.forEach((user) => {
  store.dispatch({
    type: 'USERS/ADD_USER',
    user: {
      type: user.type,
      value: user.value,
      alt: user.alt,
      id: getId(user),
    },
  });
});

const users = store.getState();

export default users;
