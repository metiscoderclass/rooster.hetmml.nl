import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import purifyWeek from '../../lib/purifyWeek';

const WeekSelector = ({ urlWeek, location, history }) => {
  const updateWeek = (change) => {
    const newWeek = purifyWeek(urlWeek + change);
    const isCurrentWeek = moment().week() === newWeek;

    const query = queryString.stringify({
      week: isCurrentWeek ? undefined : newWeek,
    });
    history.push(`${location.pathname}?${query}`);
  };

  return (
    <div>
      <button onClick={() => updateWeek(-1)}>Prev</button>
      Week {urlWeek}
      <button onClick={() => updateWeek(+1)}>Next</button>
    </div>
  );
};

WeekSelector.propTypes = {
  urlWeek: PropTypes.number.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(WeekSelector);
