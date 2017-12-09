import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './reducers';

const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
    <div>Hello World!</div>
  </Provider>,
  document.getElementById('root'),
);
