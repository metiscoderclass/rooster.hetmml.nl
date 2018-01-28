// eslint-disable-next-line import/prefer-default-export
export const fetchSchedule = (user, week) => (dispatch) => {
  dispatch({
    type: 'VIEW/FETCH_SCHEDULE_REQUEST',
    user,
    week,
  });

  fetch(`/get/${user}?week=${week}`).then(
    // success
    (r) => {
      r.text().then((htmlStr) => {
        dispatch({
          type: 'VIEW/FETCH_SCHEDULE_SUCCESS',
          user,
          week,
          htmlStr,
        });
      });
    },

    // error
    () => {
      dispatch({
        type: 'VIEW/FETCH_SCHEDULE_FAILURE',
        week,
        user,
      });
    },
  );
};
