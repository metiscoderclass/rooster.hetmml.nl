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

import './WeekSelector.scss';
import WeekDisplay from './WeekDisplay';

class WeekSelector extends React.Component {
  static propTypes = {
    // react-router
    week: PropTypes.number.isRequired,
    shiftWeek: PropTypes.func.isRequired,
  };

  render() {
    const { week, shiftWeek } = this.props;

    return (
      <div className="WeekSelector">
        <button type="button" onClick={() => shiftWeek(-1)}>
          <ArrowBackIcon />
        </button>
        <div className="text">
          <WeekDisplay
            selectedWeek={week}
            currentWeek={moment().week()}
          />
        </div>
        <button type="button" onClick={() => shiftWeek(+1)}>
          <ArrowForwardIcon />
        </button>
      </div>
    );
  }
}

export default WeekSelector;
