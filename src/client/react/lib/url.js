import moment from 'moment';
import queryString from 'query-string';
import users from '../users';
import purifyWeek from './purifyWeek';

export function userFromMatch(match) {
  const user = `${match.params.type}/${match.params.value}`;

  if (!users.allIds.includes(user)) {
    return null;
  }

  return user;
}

export function weekFromLocation(location) {
  const weekStr = queryString.parse(location.search).week;

  if (!weekStr) {
    return moment().week();
  }

  return purifyWeek(parseInt(weekStr, 10));
}
