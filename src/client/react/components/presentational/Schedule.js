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
import createDOMPurify from 'dompurify';

class Schedule extends React.Component {
  static propTypes = {
    htmlStr: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.updateScaling = this.updateScaling.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateScaling);
    this.updateScaling();
  }

  componentDidUpdate(prevProps) {
    const { htmlStr } = this.props;
    if (prevProps.htmlStr !== htmlStr) {
      this.updateScaling();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateScaling);
  }

  updateScaling() {
    const windowWidth = document.body.clientWidth;
    const tableNode = this.scheduleDiv.querySelector('table');
    if (!tableNode) return;

    // We want a 16px margin on both sides, this marging will be scaled with
    // the entire schedule.
    const tableWidth = tableNode.offsetWidth + 32;

    let scale = windowWidth / tableWidth;
    if (scale > 1) {
      scale = 1;
    }

    this.scheduleDiv.style.transform = `scale(${scale})`;
    this.scheduleDiv.style.transformOrigin = 'left top';
    this.scheduleDiv.style.margin = `${16 * scale}px`;
  }

  render() {
    const { htmlStr } = this.props;

    const DOMPurify = createDOMPurify(window);
    const cleanHTML = DOMPurify.sanitize(htmlStr, {
      ADD_ATTR: ['rules'],
    });

    return (
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: cleanHTML }}
        ref={(div) => { this.scheduleDiv = div; }}
      />
    );
  }
}

export default Schedule;
