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

import FuzzySearch from 'fuzzy-search';
import uniqBy from 'lodash/uniqBy';
import users from '../users';

const DEFAULT_STATE = {
  // results: [
  //   's/18562',
  // ],
  results: [],
  searchText: '',
  selectedResult: null,
};

function getSearchResults(allUsers, query) {
  const searcher = new FuzzySearch(allUsers, ['value', 'alt']);

  if (query.trim() === '') {
    return [];
  }

  const allResults = searcher.search(query);
  const uniqResults = uniqBy(allResults, result => result.id);
  const firstResults = uniqResults.splice(0, 4);

  const userIds = firstResults.map(result => result.id);

  return userIds;
}

const search = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'SEARCH/SET_USER': {
      const { user } = action;

      if (user == null) {
        return DEFAULT_STATE;
      }

      return {
        ...state,
        results: [],
        searchText: users.byId[user].value,
        selectedResult: user,
      };
    }

    case 'SEARCH/INPUT_CHANGE':
      return {
        ...state,
        results: getSearchResults(users.allUsers, action.searchText),
        searchText: action.searchText,
        selectedResult: null,
      };

    case 'SEARCH/CHANGE_SELECTED_RESULT': {
      const { results } = state;

      const prevSelectedResult = state.selectedResult;
      const prevSelectedResultIndex = results.indexOf(prevSelectedResult);
      let nextSelectedResultIndex =
        prevSelectedResultIndex + action.relativeChange;

      if (nextSelectedResultIndex < -1) {
        nextSelectedResultIndex = results.length - 1;
      } else if (nextSelectedResultIndex > results.length - 1) {
        nextSelectedResultIndex = -1;
      }

      const nextSelectedResult =
        nextSelectedResultIndex === -1
          ? null
          : results[nextSelectedResultIndex];

      return {
        ...state,
        selectedResult: nextSelectedResult,
      };
    }

    default:
      return state;
  }
};

export default search;

export const _test = {
  DEFAULT_STATE,
};
