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
import classnames from 'classnames';
import Result from './Result';

import './Results.scss';

class Results extends React.Component {
  static propTypes = {
    results: PropTypes.arrayOf(PropTypes.string),
    selectedResult: PropTypes.string,
    setUser: PropTypes.func.isRequired,
  };

  static defaultProps = {
    selectedResult: null,
    results: [],
  };

  render() {
    const {
      results,
      selectedResult,
      setUser,
    } = this.props;

    const hasResults = results.length > 0;

    return (
      <div
        className={classnames('Results', {
          hasResults,
        })}
        style={{
          minHeight: hasResults ? results.length * 54 : 0,
        }}
      >
        {results.map(userId => (
          <Result
            key={userId}
            userId={userId}
            isSelected={userId === selectedResult}
            onClick={() => setUser(userId)}
          />
        ))}
      </div>
    );
  }
}

export default Results;
