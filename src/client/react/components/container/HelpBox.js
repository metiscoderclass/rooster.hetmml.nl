import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class HelpBox extends React.Component {
  static propTypes = {
    // redux
    results: PropTypes.arrayOf(PropTypes.string).isRequired,
    searchText: PropTypes.string.isRequired,
  }

  render() {
    if (this.props.results.length > 0 || this.props.searchText !== '') {
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
  }
}

const mapStateToProps = state => ({
  results: state.search.results,
  searchText: state.search.searchText,
});

export default connect(mapStateToProps)(HelpBox);
