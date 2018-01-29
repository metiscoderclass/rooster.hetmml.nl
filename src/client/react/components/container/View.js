import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchSchedule } from '../../actions/view';
import extractSchedule from '../../lib/extractSchedule';

import Schedule from '../presentational/Schedule';
import Loading from '../presentational/Loading';

const View = ({
  schedules,
  user,
  week,
  dispatch,
}) => {
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
  user: PropTypes.string.isRequired,
  week: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  schedules: state.view.schedules,
});

export default withRouter(connect(mapStateToProps)(View));
