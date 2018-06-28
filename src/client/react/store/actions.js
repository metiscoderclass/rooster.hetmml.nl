import users from '../users';

export function showRoomFinder() {
  return (dispatch, getState, getHistory) => {
    const { user, setUser } = getHistory();

    if (user == null || users.byId[user].type !== 'r') {
      // We are not currently viewing a room, correct the situation.
      setUser(users.allRoomIds[0]);
    }

    dispatch({ type: 'ROOM_FINDER/SHOW' });
  };
}
