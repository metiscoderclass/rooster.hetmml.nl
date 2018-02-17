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

const DEFAULT_STATE = {
  schedules: {},
};

const view = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'VIEW/FETCH_SCHEDULE_REQUEST':
    case 'VIEW/FETCH_SCHEDULE_SUCCESS':
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [action.user]:
            state.schedules[action.user]
              ? {
                // This user already exists in our state, extend it.
                ...state.schedules[action.user],
                [action.week]: schedule(state.schedules[action.user][action.week], action),
              }
              : {
                // This user does not already exist in our state.
                [action.week]: schedule(undefined, action),
              },
        },
      };
    default:
      return state;
  }
};

export default view;

export const _test = {
  DEFAULT_STATE,
};
