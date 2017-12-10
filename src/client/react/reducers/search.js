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
          { type: 's', value: '18561' },
          { type: 'c', value: '5H2' },
          { type: 't', value: 'akh' },
          { type: 'r', value: '008-mk' },
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
