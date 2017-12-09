import React from 'react';
import Search from './components/presentational/Search';

const App = () => (
  <div>
    <Search
      onInput={() => {}}
      results={[
        { type: 's', name: '18561' },
      ]}
    />
  </div>
);

export default App;
