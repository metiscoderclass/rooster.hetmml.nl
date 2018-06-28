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
import moment from 'moment';

import ArrowBackIcon from 'react-icons/lib/md/arrow-back';
import ArrowForwardIcon from 'react-icons/lib/md/arrow-forward';

import purifyWeek from '../../lib/purifyWeek';

import './WeekSelector.scss';

class WeekSelector extends React.Component {
  static propTypes = {
    // react-router
    week: PropTypes.number.isRequired,
    setWeek: PropTypes.func.isRequired,
  };

  getWeekText() {
    const { week } = this.props;

    const currentWeek = moment().week();

    switch (week) {
      case currentWeek:
        return `Huidige week • ${week}`;
      case currentWeek + 1:
        return `Volgende week • ${week}`;
      case currentWeek - 1:
        return `Vorige week • ${week}`;
      default:
        return `Week ${week}`;
    }
  }

  updateWeek(change) {
    const { week, setWeek } = this.props;
    const newWeek = purifyWeek(week + change);

    const isCurrentWeek = moment().week() === newWeek;
    setWeek(isCurrentWeek ? undefined : newWeek);
  }

  render() {
    return (
      <div className="WeekSelector">
        <button type="button" onClick={() => this.updateWeek(-1)}>
          <ArrowBackIcon />
        </button>
        <div className="text">
          {this.getWeekText()}
        </div>
        <button type="button" onClick={() => this.updateWeek(+1)}>
          <ArrowForwardIcon />
        </button>
      </div>
    );
  }
}

export default WeekSelector;
