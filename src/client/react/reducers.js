import { combineReducers } from 'redux';
import search from './reducers/search';

const rootReducer = combineReducers({
  search,
});

export default rootReducer;
