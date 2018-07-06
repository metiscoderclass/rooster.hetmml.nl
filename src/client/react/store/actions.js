import users from '../users';
import purifyWeek from '../lib/purifyWeek';
import withinRange from '../lib/withinRange';

export function setUser(newUser) {
  return (dispatch, getState, { getHistory }) => {
    const { updatePathname } = getHistory();

    dispatch({ type: 'SEARCH/RESET' });
    updatePathname(newUser);
  };
}

export function shiftRoom(shift) {
  return (dispatch, getState, { getHistory }) => {
    const { user } = getHistory();
    const { allRoomIds } = users;

    if (users.byId[user].type !== 'r') throw new Error('User must be a room');

    const currentRoom = user;
    const currentRoomIndex = allRoomIds.indexOf(currentRoom);
    const nextRoomIndex = withinRange(
      currentRoomIndex + shift,
      allRoomIds.length - 1,
    );
    const nextRoom = allRoomIds[nextRoomIndex];

    dispatch(setUser(nextRoom));
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
