import {
  weekFromLocation,
  userFromLocation,
  makeUpdatePathname,
  makeUpdateQuery,
} from './url';

export default function makeGetHistory(history) {
  return function getHistory() {
    const user = userFromLocation(history.location);
    const week = weekFromLocation(history.location);
    const updatePathname = makeUpdatePathname(history);
    const updateQuery = makeUpdateQuery(history);

    return {
      user,
      week,
      updatePathname,
      updateQuery,
    };
  };
}
