import React from 'react';
import { LinearProgress } from 'rmwc/LinearProgress';

class Loading extends React.Component {
  render() {
    return (
      <LinearProgress determinate={false} />
    );
  }
}

export default Loading;
