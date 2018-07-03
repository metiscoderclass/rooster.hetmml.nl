import moment from 'moment';
import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import makeGetHistory from './getHistory';

export default function makeReduxMiddleware({ history }) {
  return applyMiddleware(thunk.withExtraArgument({
    getHistory: makeGetHistory(history),
    moment,
  }));
}
