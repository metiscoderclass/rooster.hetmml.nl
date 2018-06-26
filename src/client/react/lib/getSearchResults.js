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
