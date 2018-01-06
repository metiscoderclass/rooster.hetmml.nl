import { combineReducers } from 'redux';
import search, { State as SearchState } from './reducers/search';

export interface State {
  search: SearchState,
}

const rootReducer = combineReducers<State>({
  search,
});

export default rootReducer;
