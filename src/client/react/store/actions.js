import users from '../users';
import purifyWeek from '../lib/purifyWeek';

export function setUser(newUser) {
  return (dispatch, getState, { getHistory }) => {
    const { user, updatePathname } = getHistory();

    if (newUser === user) {
      // EDGE CASE: If the user that is being selected is equal to the user
      // that is already selected, then updatePathname will not change
      // anything. This results in state.search not properly being resetted.
      // Example: If you search for 5H2 while already viewing 6-5H2, pressing
      // enter won't do anything unless this check is present.
      dispatch({ type: 'SEARCH/SET_USER', user });
    } else {
      updatePathname(newUser || '');
    }
  };
}

export function setWeek(newWeek) {
  return (dispatch, getState, { getHistory, moment }) => {
    const { updateQuery } = getHistory();

    const isCurrentWeek = moment().week() === newWeek;

    updateQuery({
      week: isCurrentWeek ? undefined : newWeek,
    });
  };
}

export function shiftWeek(shift) {
  return (dispatch, getState, { getHistory }) => {
    const { week } = getHistory();
    dispatch(setWeek(purifyWeek(week + shift)));
  };
}

export function showRoomFinder() {
  return (dispatch, getState, { getHistory }) => {
    const { user } = getHistory();

    if (user == null || users.byId[user].type !== 'r') {
      // We are not currently viewing a room, correct the situation.
      dispatch(setUser(users.allRoomIds[0]));
    }

    dispatch({ type: 'ROOM_FINDER/SHOW' });
  };
}
