import moment from 'moment';
import queryString from 'query-string';
import isNaN from 'lodash/isNaN';
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
  const week = parseInt(weekStr, 10);

  if (isNaN(week)) {
    return selectCurrentWeek(store);
  }

  return purifyWeek(parseInt(weekStr, 10));
}
