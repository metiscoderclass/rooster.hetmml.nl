/**
 * Copyright (C) 2018 Noah Loomans
 *
 * This file is part of rooster.hetmml.nl.
 *
 * rooster.hetmml.nl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rooster.hetmml.nl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with rooster.hetmml.nl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
