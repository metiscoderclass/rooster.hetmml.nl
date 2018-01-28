const schedule = (state = {}, action) => {
  switch (action.type) {
    case 'VIEW/FETCH_SCHEDULE_REQUEST':
      return {
        ...state,
        state: 'fetching',
      };
    case 'VIEW/FETCH_SCHEDULE_SUCCESS':
      return {
        ...state,
        state: 'finished',
        htmlStr: action.htmlStr,
      };
    default:
      return state;
  }
};

const DEFAULT_STATE = {
  schedules: {},
};

const view = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'VIEW/FETCH_SCHEDULE_REQUEST':
    case 'VIEW/FETCH_SCHEDULE_SUCCESS':
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [action.user]:
            state.schedules[action.user]
              ? {
                // This user already exists in our state, extend it.
                ...state.schedules[action.user],
                [action.week]: schedule(state.schedules[action.user][action.week], action),
              }
              : {
                // This user does not already exist in our state.
                [action.week]: schedule(undefined, action),
              },
        },
      };
    default:
      return state;
  }
};

export default view;

export const _test = {
  DEFAULT_STATE,
};
