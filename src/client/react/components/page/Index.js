import React from 'react';
import Search from '../container/Search';
import HelpBox from '../container/HelpBox';

const App = () => (
  <div className="page-index">
    <div className="container">
      <img src="/icons/mml-logo.png" alt="Metis" />
      <Search />
      <HelpBox />
    </div>
  </div>
);

export default App;
