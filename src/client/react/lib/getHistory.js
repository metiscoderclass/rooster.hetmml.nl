import {
  weekFromLocation,
  userFromLocation,
  makeUpdatePathname,
  makeUpdateQuery,
} from './url';

/**
 * Make a getHistory function. This function is used in index.js when creating
 * the redux store.
 * @param {history} history
 *   The history object from the `history` package.
 *   There may only be a single shared history object in the application, which
 *   is why it's delivered from `../index.js`.
 */
export default function makeGetHistory(history) {
  /**
   * Get a collection of helpers for common browser history interactions, and a
   * collection of precalculated values from the address bar. This function is
   * used in actions.
   */
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
