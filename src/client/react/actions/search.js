export const setUser = user => ({
  type: 'SEARCH/SET_USER',
  user,
});

export const inputChange = searchText => ({
  type: 'SEARCH/INPUT_CHANGE',
  searchText,
});

/**
 * Change the selected result.
 * @param {+1/-1} relativeChange usually +1 or -1, the change relative to the
 *     current result.
 */
export const changeSelectedResult = relativeChange => ({
  type: 'SEARCH/CHANGE_SELECTED_RESULT',
  relativeChange,
});
