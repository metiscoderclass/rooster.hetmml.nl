/* global USERS */
import fuzzy from 'fuzzy';

const DEFAULT_STATE = {
  input: '',
  results: [
    { type: 's', value: '18561' },
  ],
  selectedResult: null,
  isExactMatch: false,
};

function getSearchResults(query) {
  if (query.trim() === '') {
    return [];
  }

  const allResults = fuzzy.filter(query, USERS, {
    extract: user => user.value,
  });

  const firstResults = allResults.splice(0, 4);
  const users = firstResults.map(result => result.original);

  return users;
}

const search = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'SEARCH/INPUT_CHANGE': {
      let results = getSearchResults(action.typedValue);
      let selectedResult = null;
      let isExactMatch = false;

      // Is the typed value exactly the same as the first result? Then show the
      // appropiate icon instead of the generic search icon.
      if ((results.length > 0) && (action.typedValue === results[0].value)) {
        [selectedResult] = results;
        isExactMatch = true;
        results = results.splice(1);
      }

      return {
        ...state,
        input: action.typedValue,
        results,
        selectedResult,
        isExactMatch,
      };
    }
    default:
      return state;
  }
};

export default search;
