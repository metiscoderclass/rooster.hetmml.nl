const DEFAULT_STATE = {
  schedules: {},
};

const view = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'VIEW/FETCH_SCHEDULE_REQUEST':
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [action.user]: {
            state: 'fetching',
          },
        },
      };
    case 'VIEW/FETCH_SCHEDULE_SUCCESS':
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [action.user]: {
            ...state.schedules[action.user],
            state: 'finished',
            htmlStr: action.htmlStr,
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
