import React from 'react';
import { LinearProgress } from 'rmwc/LinearProgress';

class Loading extends React.Component {
  render() {
    return (
      <div className="loading">
        <LinearProgress determinate={false} />
      </div>
    );
  }
}

export default Loading;
