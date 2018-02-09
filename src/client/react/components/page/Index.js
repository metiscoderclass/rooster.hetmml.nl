import React from 'react';
import Search from '../container/Search';
import HelpBox from '../container/HelpBox';

class IndexPage extends React.Component {
  render() {
    return (
      <div className="page-index">
        <div className="container">
          <img src="/icons/mml-logo.png" alt="Metis" />
          <Search />
          <HelpBox />
        </div>
      </div>
    );
  }
}

export default IndexPage;
