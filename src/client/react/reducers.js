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

import getSearchResults from './lib/getSearchResults';
import users from './users';

const DEFAULT_STATE = {
  // results: [
  //   's/18562',
  // ],
  search: {
    results: [],
    text: '',
    selected: null,
  },
  schedules: {},
};

const schedule = (state = {}, action) => {
  switch (action.type) {
    case 'VIEW/FETCH_SCHEDULE_REQUEST':
      return {
        ...state,
        state: 'FETCHING',
      };
    case 'VIEW/FETCH_SCHEDULE_SUCCESS':
      return {
        ...state,
        state: 'FINISHED',
        htmlStr: action.htmlStr,
      };
    default:
      return state;
  }
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case 'SEARCH/SET_USER': {
      const { user } = action;

      if (user == null) {
        return {
          ...state,
          search: DEFAULT_STATE.search,
        };
      }

      return {
        ...state,
        search: {
          results: [],
          text: users.byId[user].value,
          selected: user,
        },
      };
    }

    case 'SEARCH/INPUT_CHANGE':
      return {
        ...state,
        search: {
          results: getSearchResults(action.searchText),
          text: action.searchText,
          selected: null,
        },
      };

    case 'SEARCH/CHANGE_SELECTED_RESULT': {
      const prevSelectedResult = state.search.selected;
      const prevSelectedResultIndex = state.search.results.indexOf(prevSelectedResult);
      let nextSelectedResultIndex =
        prevSelectedResultIndex + action.relativeChange;

      if (nextSelectedResultIndex < -1) {
        nextSelectedResultIndex = state.search.results.length - 1;
      } else if (nextSelectedResultIndex > state.search.results.length - 1) {
        nextSelectedResultIndex = -1;
      }

      const nextSelectedResult =
        nextSelectedResultIndex === -1
          ? null
          : state.search.results[nextSelectedResultIndex];

      return {
        ...state,
        search: {
          ...state.search,
          selected: nextSelectedResult,
        },
      };
    }

    case 'VIEW/FETCH_SCHEDULE_REQUEST':
    case 'VIEW/FETCH_SCHEDULE_SUCCESS':
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [`${action.user}:${action.week}`]:
            schedule(state.schedules[`${action.user}:${action.week}`], action),
        },
      };

    default:
      return state;
  }
}

export default reducer;
export const _test = {
  DEFAULT_STATE,
};
