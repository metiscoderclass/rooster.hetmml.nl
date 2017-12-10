// eslint-disable-next-line import/prefer-default-export
export const inputChange = typedValue => ({
  type: 'SEARCH/INPUT_CHANGE',
  typedValue,
});

export const focusChange = hasFocus => ({
  type: 'SEARCH/FOCUS_CHANGE',
  hasFocus,
});
