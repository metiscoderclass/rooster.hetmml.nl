import moment from 'moment';
import queryString from 'query-string';
import purifyWeek from '../lib/purifyWeek';
import users from '../users';

export function selectUser(store) {
  const { location } = store.router;
  const match = location.pathname.match(/^\/([stcr])\/([-0-9a-zA-Z]+)/);
  if (!match) return null;

  const user = `${match[1]}/${match[2]}`;
  if (!users.allIds.includes(user)) return null;

  return user;
}

export function selectCurrentWeek(store) {
  return moment(store.now).week();
}

export function selectWeek(store) {
  const { location } = store.router;
  const weekStr = queryString.parse(location.search).week;

  if (!weekStr) {
    return selectCurrentWeek(store);
  }

  return purifyWeek(parseInt(weekStr, 10));
}
