import {
  makeSetUser,
  makeSetWeek,
  weekFromLocation,
  userFromLocation,
} from './url';

export default function makeGetHistory(history) {
  return function getHistory() {
    const user = userFromLocation(history.location);
    const week = weekFromLocation(history.location);
    const setUser = makeSetUser(history);
    const setWeek = makeSetWeek(history);

    return {
      user,
      week,
      setUser,
      setWeek,
    };
  };
}
