// eslint-disable-next-line import/prefer-default-export
export const fetchSchedule = user => (dispatch) => {
  dispatch({
    type: 'VIEW/FETCH_SCHEDULE_REQUEST',
    user,
  });

  fetch(`/get/${user}`).then(
    // success
    (r) => {
      r.text().then((htmlStr) => {
        dispatch({
          type: 'VIEW/FETCH_SCHEDULE_SUCCESS',
          user,
          htmlStr,
        });
      });
    },

    // error
    () => {
      dispatch({
        type: 'VIEW/FETCH_SCHEDULE_FAILURE',
        user,
      });
    },
  );
};
