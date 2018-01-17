import { combineReducers } from 'redux';
import search from './reducers/search';
import view from './reducers/view';

const rootReducer = combineReducers({
  search,
  view,
});

export default rootReducer;
