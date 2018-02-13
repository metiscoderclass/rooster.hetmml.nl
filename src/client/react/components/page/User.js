import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Elevation } from 'rmwc/Elevation';
import Search from '../container/Search';
import View from '../container/View';
import { userFromMatch } from '../../lib/url';
import WeekSelector from '../container/WeekSelector';

class UserPage extends React.Component {
  static propTypes = {
    // react-router
    match: PropTypes.object.isRequired,
  };

  render() {
    const user = userFromMatch(this.props.match);

    if (!user) {
      // Invalid user, redirect to index.
      return <Redirect to="/" />;
    }

    return (
      <div className="page-user">
        <div className="search-wrapper">
          <div className="search-container">
            <Search />
          </div>
        </div>
        <Elevation z={2}>
          <div className="menu">
            <div className="menu-container">
              <WeekSelector />
            </div>
          </div>
        </Elevation>
        <View />
      </div>
    );
  }
}

export default UserPage;
