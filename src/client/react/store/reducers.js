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

import getSearchResults from '../lib/getSearchResults';
import withinRange from '../lib/withinRange';

const DEFAULT_STATE = {
  timestamp: Date.now(),
  search: null,
  isRoomFinderVisible: false,
  schedules: {},
};

const schedule = (state = {}, action) => {
  switch (action.type) {
    case 'VIEW/FETCH_SCHEDULE_START':
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
    case 'SEARCH/RESET': {
      return {
        ...state,
        search: null,
      };
    }

    case 'SEARCH/INPUT_CHANGE': {
      const results = getSearchResults(action.searchText);

      return {
        ...state,
        search: {
          results,
          text: action.searchText,
          selected: results.length > 0 ? results[0] : null,
        },
      };
    }

    case 'SEARCH/CHANGE_SELECTED_RESULT': {
      if (!state.search || state.search.results.length === 0) {
        return state;
      }

      const prevSelectedResult = state.search.selected;
      const prevSelectedResultIndex = state.search.results.indexOf(prevSelectedResult);
      const nextSelectedResultIndex = withinRange(
        prevSelectedResultIndex + action.relativeChange,
        state.search.results.length - 1,
      );

      const nextSelectedResult = state.search.results[nextSelectedResultIndex];

      return {
        ...state,
        search: {
          ...state.search,
          selected: nextSelectedResult,
        },
      };
    }

    case 'ROOM_FINDER/SHOW':
      return {
        ...state,
        isRoomFinderVisible: true,
      };

    case 'ROOM_FINDER/HIDE':
      return {
        ...state,
        isRoomFinderVisible: false,
      };

    case 'VIEW/FETCH_SCHEDULE_START':
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
