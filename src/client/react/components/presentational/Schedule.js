import React from 'react';
import PropTypes from 'prop-types';
import createDOMPurify from 'dompurify';

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

export default Schedule;
