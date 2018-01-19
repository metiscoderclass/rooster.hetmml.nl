import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const HelpBox = ({ results }) => {
  if (results.length > 0) {
    return <div />;
  }

  return (
    <div className="help-box">
      Voer hier een docentafkorting, klas, leerlingnummer of lokaalnummer in.
    </div>
  );
};

HelpBox.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  results: state.search.results,
});

export default connect(mapStateToProps)(HelpBox);
