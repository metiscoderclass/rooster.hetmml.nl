import users from '../users';
import purifyWeek from '../lib/purifyWeek';

export function setUser(newUser) {
  return (dispatch, getState, { getHistory }) => {
    const { user, updatePathname } = getHistory();

    if (newUser === user) {
      // EDGE CASE: The user is set if the user changes, but it doesn't
      // change if the result is already the one we are viewing.
      // Causing  the <Results /> object to not collapse when a user is
      // selected.
      // Therefor, we need to dispatch the SET_USER command manually.
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
