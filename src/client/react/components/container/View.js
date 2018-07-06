/**
 * Copyright (C) 2018 Noah Loomans
 *
 * This file is part of rooster.hetmml.nl.
 *
 * rooster.hetmml.nl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rooster.hetmml.nl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with rooster.hetmml.nl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectUser, selectWeek } from '../../store/selectors';
import extractSchedule from '../../lib/extractSchedule';

import Schedule from '../presentational/Schedule';
import Loading from '../presentational/Loading';
import ScheduleErrorDisplay from '../presentational/ScheduleErrorDisplay';
import * as actions from '../../store/actions';

class View extends React.Component {
  static propTypes = {
    schedules: PropTypes.objectOf(PropTypes.shape({
      state: PropTypes.string.isRequired,
      htmlStr: PropTypes.string,
    })).isRequired,
    user: PropTypes.string.isRequired,
    week: PropTypes.number.isRequired,

    fetchScheduleIfNeeded: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchScheduleIfNeeded, user, week } = this.props;
    fetchScheduleIfNeeded(user, week);
  }

  componentDidUpdate(prevProps) {
    const { fetchScheduleIfNeeded, user, week } = this.props;

    if (prevProps.user !== user || prevProps.week !== week) {
      fetchScheduleIfNeeded(user, week);
    }
  }

  render() {
    const {
      user,
      week,
      schedules,
    } = this.props;

    const schedule = extractSchedule(schedules, user, week);

    switch (schedule.state) {
      case 'NOT_REQUESTED':
      case 'FETCHING':
        return <Loading />;
      case 'FINISHED':
        return <Schedule htmlStr={schedule.htmlStr} />;
      case 'ERROR':
        return <ScheduleErrorDisplay error={schedule.error} />;
      default:
        throw new Error(`${schedule.state} is not a valid schedule state.`);
    }
  }
}

const mapStateToProps = (state) => {
  const user = selectUser(state);
  const week = selectWeek(state);
  return {
    user,
    week,
    schedules: state.schedules,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchScheduleIfNeeded: (user, week) => (
    dispatch(actions.fetchScheduleIfNeeded(user, week))
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
