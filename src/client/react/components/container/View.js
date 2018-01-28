import React from 'react';
import PropTypes from 'prop-types';
import createDOMPurify from 'dompurify';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchSchedule } from '../../actions/view';
import extractSchedule from '../../lib/extractSchedule';

class View extends React.Component {
  renderLoading() {
    return (
      <div>
        Loading...
      </div>
    );
  }

  renderSchedule(htmlStr) {
    const DOMPurify = createDOMPurify(window);

    const cleanHTML = DOMPurify.sanitize(htmlStr, {
      ADD_ATTR: ['rules'],
    });

    return (
      // eslint-disable-next-line react/no-danger
      <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
    );
  }

  render() {
    const schedule = extractSchedule(this.props.schedules, this.props.user, this.props.week);

    switch (schedule.state) {
      case 'NOT_REQUESTED':
        this.props.dispatch(fetchSchedule(this.props.user, this.props.week));
        return this.renderLoading();
      case 'FETCHING':
        return this.renderLoading();
      case 'FINISHED':
        return this.renderSchedule(schedule.htmlStr);
      default:
        throw new Error(`${schedule.state} is not a valid schedule state.`);
    }
  }
}

View.propTypes = {
  user: PropTypes.string.isRequired,
  week: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  schedules: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape({
    state: PropTypes.string.isRequired,
    htmlStr: PropTypes.string,
  }))).isRequired,
};

const mapStateToProps = state => ({
  schedules: state.view.schedules,
});

export default withRouter(connect(mapStateToProps)(View));
