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

class View extends React.Component {
  static propTypes = {
    schedules: PropTypes.objectOf(PropTypes.shape({
      state: PropTypes.string.isRequired,
      htmlStr: PropTypes.string,
    })).isRequired,

    // react-router
    user: PropTypes.string.isRequired,
    week: PropTypes.number.isRequired,

    // redux
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.fetchScheduleIfNeeded();
  }

  fetchScheduleIfNeeded() {
    const {
      user,
      week,
      schedules,
      dispatch,
    } = this.props;

    const schedule = extractSchedule(schedules, user, week);

    if (schedule.state === 'NOT_REQUESTED') {
      fetch(`/get/${user}?week=${week}`).then(r => r.text()).then(
        // success
        (htmlStr) => {
          dispatch({
            type: 'VIEW/FETCH_SCHEDULE_SUCCESS',
            user,
            week,
            htmlStr,
          });
        },

        // error
        () => {
          dispatch({
            type: 'VIEW/FETCH_SCHEDULE_FAILURE',
            week,
            user,
          });
        },
      );
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
      default:
        throw new Error(`${schedule.state} is not a valid schedule state.`);
    }
  }
}

const mapStateToProps = (state) => {
  const user = selectUser(state);
  const week = selectWeek(state);
  return {
    key: `${user}:${week}`,
    user,
    week,
    schedules: state.schedules,
  };
};

export default connect(mapStateToProps)(View);
