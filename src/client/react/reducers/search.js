/* global USERS */
import fuzzy from 'fuzzy';

const DEFAULT_STATE = {
  searchInput: '',
  searchResults: [
    { type: 's', value: '18561' },
  ],
  hasFocus: false,
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
    case 'SEARCH/INPUT_CHANGE':
      return {
        ...state,
        searchInput: action.typedValue,
        searchResults: getSearchResults(action.typedValue),
      };
    case 'SEARCH/FOCUS_CHANGE':
      return {
        ...state,
        hasFocus: action.hasFocus,
      };
    default:
      return state;
  }
};

export default search;
