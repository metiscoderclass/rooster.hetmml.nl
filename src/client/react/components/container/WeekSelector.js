import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import ArrowBackIcon from 'react-icons/lib/md/arrow-back';
import ArrowForwardIcon from 'react-icons/lib/md/arrow-forward';

import purifyWeek from '../../lib/purifyWeek';
import { weekFromLocation } from '../../lib/url';

class WeekSelector extends React.Component {
  static propTypes = {
    // react-router
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  getWeekText() {
    const week = weekFromLocation(this.props.location);

    const currentWeek = moment().week();

    if (currentWeek === week) {
      return `Huidige week • ${week}`;
    } else if (currentWeek + 1 === week) {
      return `Volgende week • ${week}`;
    } else if (currentWeek - 1 === week) {
      return `Vorige week • ${week}`;
    }

    return `Week ${week}`;
  }

  updateWeek(change) {
    const week = weekFromLocation(this.props.location);

    const newWeek = purifyWeek(week + change);
    const isCurrentWeek = moment().week() === newWeek;

    const query = queryString.stringify({
      week: isCurrentWeek ? undefined : newWeek,
    });
    this.props.history.push(`${this.props.location.pathname}?${query}`);
  }

  render() {
    return (
      <div className="week-selector">
        <button onClick={() => this.updateWeek(-1)}><ArrowBackIcon /></button>
        <div className="text">{this.getWeekText()}</div>
        <button onClick={() => this.updateWeek(+1)}><ArrowForwardIcon /></button>
      </div>
    );
  }
}

export default withRouter(WeekSelector);
