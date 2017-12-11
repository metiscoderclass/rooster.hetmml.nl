import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

import SearchIcon from 'react-icons/lib/md/search';

import { inputChange, focusChange } from '../../actions/search';

import Results from './Results';
import IconFromUserType from '../presentational/IconFromUserType';

const userShape = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasFocus: false,
    };

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onFocus() {
    this.setState({
      hasFocus: true,
    });
  }

  onBlur() {
    this.setState({
      hasFocus: false,
    });
  }

  render() {
    const {
      onInputChange,
      value,
      exactMatch,
    } = this.props;

    const {
      hasFocus,
    } = this.state;

    return (
      <div className={classnames('search', { 'search--has-focus': hasFocus })}>
        <div className="search__input-wrapper">
          <div className="search__icon-wrapper">
            <IconFromUserType
              userType={exactMatch ? exactMatch.type : null}
              defaultIcon={<SearchIcon />}
            />
          </div>
          <input
            id="search__input"
            onChange={onInputChange}
            value={value}
            placeholder="Zoeken"
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
        </div>
        <Results />
      </div>
    );
  }
}

Search.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  exactMatch: PropTypes.shape(userShape),
};

Search.defaultProps = {
  exactMatch: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  value: state.search.input,
  exactMatch: state.search.exactMatch,
});

const mapDispatchToProps = dispatch => ({
  onInputChange: (event) => {
    dispatch(inputChange(event.target.value));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
