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

import FuzzySearch from 'fuzzy-search';
import uniqBy from 'lodash/uniqBy';
import users from '../users';

function getSearchResults(query) {
  const searcher = new FuzzySearch(users.allUsers, ['value', 'alt']);

  if (query.trim() === '') {
    return [];
  }

  const allResults = searcher.search(query);
  const uniqResults = uniqBy(allResults, result => result.id);
  const firstResults = uniqResults.splice(0, 4);

  const userIds = firstResults.map(result => result.id);

  return userIds;
}

export default getSearchResults;
