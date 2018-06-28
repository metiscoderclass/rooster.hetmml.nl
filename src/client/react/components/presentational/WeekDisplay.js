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
