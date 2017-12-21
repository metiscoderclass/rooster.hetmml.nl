export interface InputChangeAction {
  type: 'SEARCH/INPUT_CHANGE',
  typedValue: string,
}

export const inputChange = (typedValue: string): InputChangeAction => ({
  type: 'SEARCH/INPUT_CHANGE',
  typedValue,
});

export interface ChangeSelectedResultAction {
  type: 'SEARCH/CHANGE_SELECTED_RESULT',
  relativeChange: 1 | -1,
}

/**
 * Change the selected result.
 * @param {+1/-1} relativeChange usually +1 or -1, the change relative to the
 *     current result.
 */
export const changeSelectedResult = (relativeChange: 1 | -1): ChangeSelectedResultAction => ({
  type: 'SEARCH/CHANGE_SELECTED_RESULT',
  relativeChange,
});
