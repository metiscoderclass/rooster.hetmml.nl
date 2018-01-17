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
    if (!this.loadingFinished(this.props.user)) {
      this.props.dispatch(fetchSchedule(this.props.user));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user && !this.loadingFinished(nextProps.user)) {
      this.props.dispatch(fetchSchedule(nextProps.user));
    }
  }

  loadingFinished(user) {
    return this.props.schedules.hasOwnProperty(user) &&
      this.props.schedules[user].state === 'finished';
  }

  render() {
    if (!this.loadingFinished(this.props.user)) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const cleanHTML = cleanMeetingpointHTML(this.props.schedules[this.props.user].htmlStr);

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
