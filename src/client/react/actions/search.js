export const inputChange = typedValue => ({
  type: 'SEARCH/INPUT_CHANGE',
  typedValue,
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
