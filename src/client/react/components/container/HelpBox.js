import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const HelpBox = ({ results, searchText }) => {
  if (results.length > 0 || searchText !== '') {
    return <div />;
  }

  return (
    <div className="help-box">
      <div className="arrow" />
      <div className="bubble">
        Voer hier een docentafkorting, klas, leerlingnummer of lokaalnummer in.
      </div>
    </div>
  );
};

HelpBox.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchText: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  results: state.search.results,
  searchText: state.search.searchText,
});

export default connect(mapStateToProps)(HelpBox);
