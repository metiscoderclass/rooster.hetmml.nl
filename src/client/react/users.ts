/* global USERS */

import { combineReducers, createStore } from 'redux';

export interface User {
  type: string,
  value: string,
  id: string,
}

type Action = {
  type: 'USERS/ADD_USER',
  user: User,
}

declare global {
  interface Window {
    USERS: User[];
  }
}

const getId = ({ type, value }: User) => `${type}/${value}`;

const byId = (state = {}, action: Action) => {
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

const allIds = (state : any[] = [], action : Action) => {
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

const allUsers = (state : any[] = [], action : Action) => {
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

interface State {
  byId: any,
  allIds: string[],
  allUsers: User[]
}

const store = createStore(combineReducers<State>({
  byId,
  allIds,
  allUsers,
}));

window.USERS.forEach((user) => {
  store.dispatch({
    type: 'USERS/ADD_USER',
    user: {
      type: user.type,
      value: user.value,
      id: getId(user),
    },
  });
});

const users = store.getState();

export default users;
