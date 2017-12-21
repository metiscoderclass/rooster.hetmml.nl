import * as fuzzy from 'fuzzy';
import users, { User } from '../users';
import { InputChangeAction, ChangeSelectedResultAction } from '../actions/search';

export interface State {
  results: string[],
  selectedResult: string | null,
  isExactMatch: boolean,
};

export type Action = InputChangeAction | ChangeSelectedResultAction;

const DEFAULT_STATE: State = {
  results: [
    's/18562',
  ],
  selectedResult: null,
  isExactMatch: false,
};

function getSearchResults(allUsers: User[], query: string) {
  if (query.trim() === '') {
    return [];
  }

  const allResults = fuzzy.filter(query, allUsers, {
    extract: (user: User) => user.value,
  });

  const firstResults = allResults.splice(0, 4);
  const userIds = firstResults.map((result: { original: User }) => result.original.id);

  return userIds;
}

const search = (state = DEFAULT_STATE, action: Action): State => {
  switch (action.type) {
    case 'SEARCH/INPUT_CHANGE': {
      const results = getSearchResults(users.allUsers, action.typedValue);
      let selectedResult = null;
      let isExactMatch = false;

      // Is the typed value exactly the same as the first result? Then show the
      // appropiate icon instead of the generic search icon.
      if ((results.length === 1) && (action.typedValue === users.byId[results[0]].value)) {
        [selectedResult] = results;
        isExactMatch = true;
      }

      return {
        ...state,
        results,
        selectedResult,
        isExactMatch,
      };
    }

    case 'SEARCH/CHANGE_SELECTED_RESULT': {
      const { results, isExactMatch } = state;

      if (isExactMatch) return state;

      const prevSelectedResult = state.selectedResult;
      const prevSelectedResultIndex = prevSelectedResult ? results.indexOf(prevSelectedResult) : -1;
      let nextSelectedResultIndex =
        prevSelectedResultIndex + action.relativeChange;

      if (nextSelectedResultIndex < -1) {
        nextSelectedResultIndex = results.length - 1;
      } else if (nextSelectedResultIndex > results.length - 1) {
        nextSelectedResultIndex = -1;
      }

      const nextSelectedResult =
        nextSelectedResultIndex === -1
          ? null
          : results[nextSelectedResultIndex];

      return {
        ...state,
        selectedResult: nextSelectedResult,
      };
    }

    default:
      return state;
  }
};

export default search;
