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

import './HelpBox.scss';

class HelpBox extends React.Component {
  static propTypes = {
    // redux
    results: PropTypes.arrayOf(PropTypes.string).isRequired,
    searchText: PropTypes.string.isRequired,
  }

  render() {
    const { results, searchText } = this.props;
    if (results.length > 0 || searchText !== '') {
      return <div />;
    }

    return (
      <div className="HelpBox">
        <div className="arrow" />
        <div className="bubble">
          Voer hier een docentafkorting, klas, leerlingnummer of lokaalnummer in.
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  results: state.search.results,
  searchText: state.search.text,
});

export default connect(mapStateToProps)(HelpBox);
