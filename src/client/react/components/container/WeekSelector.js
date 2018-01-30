import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import ArrowBackIcon from 'react-icons/lib/md/arrow-back';
import ArrowForwardIcon from 'react-icons/lib/md/arrow-forward';

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
    <div className="week-selector">
      <button onClick={() => updateWeek(-1)}><ArrowBackIcon /></button>
      <div className="text">Week {urlWeek}</div>
      <button onClick={() => updateWeek(+1)}><ArrowForwardIcon /></button>
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
