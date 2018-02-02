import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { userFromMatch, weekFromLocation } from '../../lib/url';
import { fetchSchedule } from '../../actions/view';
import extractSchedule from '../../lib/extractSchedule';

import Schedule from '../presentational/Schedule';
import Loading from '../presentational/Loading';

const View = ({
  schedules,
  match,
  location,
  dispatch,
}) => {
  const user = userFromMatch(match);
  const week = weekFromLocation(location);
  const schedule = extractSchedule(schedules, user, week);

  switch (schedule.state) {
    case 'NOT_REQUESTED':
      dispatch(fetchSchedule(user, week));
      return <Loading />;
    case 'FETCHING':
      return <Loading />;
    case 'FINISHED':
      return <Schedule htmlStr={schedule.htmlStr} />;
    default:
      throw new Error(`${schedule.state} is not a valid schedule state.`);
  }
};

View.propTypes = {
  schedules: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape({
    state: PropTypes.string.isRequired,
    htmlStr: PropTypes.string,
  }))).isRequired,

  // react-router
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,

  // redux
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  schedules: state.view.schedules,
});

export default withRouter(connect(mapStateToProps)(View));
