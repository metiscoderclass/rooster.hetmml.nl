import { combineReducers } from 'redux';
import search, { State as SearchState } from './reducers/search';

export interface State {
  search: SearchState,
}

// @ts-ignore
const rootReducer = combineReducers<State>({
  search,
});

export default rootReducer;
