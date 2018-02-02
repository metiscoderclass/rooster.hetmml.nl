import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import ArrowBackIcon from 'react-icons/lib/md/arrow-back';
import ArrowForwardIcon from 'react-icons/lib/md/arrow-forward';

import purifyWeek from '../../lib/purifyWeek';
import { weekFromLocation } from '../../lib/url';

const WeekSelector = ({ location, history }) => {
  const week = weekFromLocation(location);

  const updateWeek = (change) => {
    const newWeek = purifyWeek(week + change);
    const isCurrentWeek = moment().week() === newWeek;

    const query = queryString.stringify({
      week: isCurrentWeek ? undefined : newWeek,
    });
    history.push(`${location.pathname}?${query}`);
  };

  return (
    <div className="week-selector">
      <button onClick={() => updateWeek(-1)}><ArrowBackIcon /></button>
      <div className="text">Week {week}</div>
      <button onClick={() => updateWeek(+1)}><ArrowForwardIcon /></button>
    </div>
  );
};

WeekSelector.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(WeekSelector);
