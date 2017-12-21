/* global USERS */

import { combineReducers, createStore } from 'redux';
import { AnyAction } from 'redux';
import { Reducer } from 'redux';
import { ReducersMapObject } from 'redux';

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

type ByIdState = {
  [userId: string]: User,
}

const byId = (state: ByIdState = {}, action: Action): ByIdState => {
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

type AllIdsState = string[]

const allIds = (state: AllIdsState = [], action: Action): AllIdsState => {
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

type AllUsersState = User[];

const allUsers = (state: AllUsersState = [], action: Action): AllUsersState => {
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
  byId: ByIdState,
  allIds: AllIdsState,
  allUsers: AllUsersState,
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
