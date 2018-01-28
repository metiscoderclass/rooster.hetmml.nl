import React from 'react';
import PropTypes from 'prop-types';
import createDOMPurify from 'dompurify';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchSchedule } from '../../actions/view';

function cleanMeetingpointHTML(htmlStr) {
  const DOMPurify = createDOMPurify(window);

  return DOMPurify.sanitize(htmlStr, {
    ADD_ATTR: ['rules'],
  });
}

class View extends React.Component {
  componentDidMount() {
    if (!this.loadingFinished(this.props.user, this.props.week)) {
      this.props.dispatch(fetchSchedule(this.props.user, this.props.week));
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.user !== this.props.user || nextProps.week !== this.props.week)
        && !this.loadingFinished(nextProps.user, nextProps.week)) {
      this.props.dispatch(fetchSchedule(nextProps.user, nextProps.week));
    }
  }

  loadingFinished(user, week) {
    return this.props.schedules.hasOwnProperty(user) &&
      this.props.schedules[user].hasOwnProperty(week) &&
      this.props.schedules[user][week].state === 'finished';
  }

  render() {
    if (!this.loadingFinished(this.props.user, this.props.week)) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const cleanHTML = cleanMeetingpointHTML(this.props.schedules[this.props.user][this.props.week].htmlStr);

    return (
      // eslint-disable-next-line react/no-danger
      <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
    );
  }
}

View.propTypes = {
  user: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  schedules: PropTypes.objectOf(PropTypes.shape({
    state: PropTypes.string.isRequired,
    htmlStr: PropTypes.string,
  })).isRequired,
};

View.defaultProps = {
  user: null,
};

const mapStateToProps = state => ({
  schedules: state.view.schedules,
});

export default withRouter(connect(mapStateToProps)(View));
