const DEFAULT_STATE = {
  searchInput: '',
  searchResults: [],
};

const search = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'SEARCH/INPUT_CHANGE':
      return {
        ...state,
        searchInput: action.typedValue,
        searchResults: [
          { type: 's', name: '18561' },
        ],
      };
    default:
      return state;
  }
};

export default search;
