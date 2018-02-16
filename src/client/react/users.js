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
