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

  componentDidUpdate() {
    this.updateScaling();
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
    const DOMPurify = createDOMPurify(window);

    const cleanHTML = DOMPurify.sanitize(this.props.htmlStr, {
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
