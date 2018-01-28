import React from 'react';
import PropTypes from 'prop-types';
import createDOMPurify from 'dompurify';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchSchedule } from '../../actions/view';
import extractSchedule from '../../lib/extractSchedule';

const Loading = () => <div>Loading...</div>;

const Schedule = ({ htmlStr }) => {
  const DOMPurify = createDOMPurify(window);

  const cleanHTML = DOMPurify.sanitize(htmlStr, {
    ADD_ATTR: ['rules'],
  });

  return (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
  );
};

Schedule.propTypes = {
  htmlStr: PropTypes.string.isRequired,
};

const View = ({
  schedules,
  user,
  week,
  dispatch,
}) => {
  const schedule = extractSchedule(schedules, user, week);

  switch (schedule.state) {
    case 'NOT_REQUESTED':
      dispatch(fetchSchedule(user, week));
      return <Loading />;
    case 'FETCHING':
      return <Loading />;
    case 'FINISHED':
      return <Schedule htmlStr={schedule.htmlStr} />;
    default:
      throw new Error(`${schedule.state} is not a valid schedule state.`);
  }
};

View.propTypes = {
  schedules: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape({
    state: PropTypes.string.isRequired,
    htmlStr: PropTypes.string,
  }))).isRequired,
  user: PropTypes.string.isRequired,
  week: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  schedules: state.view.schedules,
});

export default withRouter(connect(mapStateToProps)(View));
