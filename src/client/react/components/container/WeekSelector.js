import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import momentPropTypes from 'react-moment-proptypes';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

const WeekSelector = ({ urlWeek, location, history }) => {
  const updateWeek = (change) => {
    const newWeek = moment().week(urlWeek.week() + change);
    const isCurrentWeek = moment().week() === newWeek.week();
    history.push(`${location.pathname}?${queryString.stringify({ week: isCurrentWeek ? undefined : newWeek.week() })}`);
  };

  return (
    <div>
      <button onClick={() => updateWeek(-1)}>Prev</button>
      Week {urlWeek.week()}
      <button onClick={() => updateWeek(+1)}>Next</button>
    </div>
  );
};

WeekSelector.propTypes = {
  urlWeek: momentPropTypes.momentObj.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(WeekSelector);
