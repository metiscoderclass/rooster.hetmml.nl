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

class WeekDisplay extends React.Component {
  static propTypes = {
    selectedWeek: PropTypes.number.isRequired,
    currentWeek: PropTypes.number.isRequired,
  }

  render() {
    const { selectedWeek, currentWeek } = this.props;

    switch (selectedWeek) {
      case currentWeek:
        return `Huidige week • ${selectedWeek}`;
      case currentWeek + 1:
        return `Volgende week • ${selectedWeek}`;
      case currentWeek - 1:
        return `Vorige week • ${selectedWeek}`;
      default:
        return `Week ${selectedWeek}`;
    }
  }
}

export default WeekDisplay;
