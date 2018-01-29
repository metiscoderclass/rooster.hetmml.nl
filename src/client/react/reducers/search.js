import fuzzy from 'fuzzy';
import users from '../users';

const DEFAULT_STATE = {
  // results: [
  //   's/18562',
  // ],
  results: [],
  searchText: '',
  selectedResult: null,
  isExactMatch: false,
};

function getSearchResults(allUsers, query) {
  if (query.trim() === '') {
    return [];
  }

  const allResults = fuzzy.filter(query, allUsers, {
    extract: user => user.value,
  });

  const firstResults = allResults.splice(0, 4);
  const userIds = firstResults.map(result => result.original.id);

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
        isExactMatch: true,
      };
    }

    case 'SEARCH/INPUT_CHANGE': {
      const { searchText } = action;
      const results = getSearchResults(users.allUsers, action.searchText);
      let selectedResult = null;
      let isExactMatch = false;

      // Is the typed value exactly the same as the first result? Then show the
      // appropriate icon instead of the generic search icon.
      if ((results.length === 1) && (action.searchText === users.byId[results[0]].value)) {
        [selectedResult] = results;
        isExactMatch = true;
      }

      return {
        ...state,
        results,
        searchText,
        selectedResult,
        isExactMatch,
      };
    }

    case 'SEARCH/CHANGE_SELECTED_RESULT': {
      const { results, isExactMatch } = state;

      if (isExactMatch) return state;

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
