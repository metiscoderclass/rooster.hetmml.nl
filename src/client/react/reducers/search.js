const DEFAULT_STATE = {
  searchInput: '',
  searchResults: [],
  hasFocus: false,
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
