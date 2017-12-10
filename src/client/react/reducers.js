const DEFAULT_STATE = {
  searchInput: '',
  searchResults: [],
};

const reducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'TYPE':
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

export default reducer;
