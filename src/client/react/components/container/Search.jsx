import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

import SearchIcon from 'react-icons/lib/md/search';

import { inputChange, changeSelectedResult } from '../../actions/search';

import users from '../../users';
import Results from './Results';
import IconFromUserType from '../presentational/IconFromUserType';

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasFocus: false,
    };

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
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

  onKeyDown(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      switch (event.key) {
        case 'ArrowUp':
          this.props.dispatch(changeSelectedResult(-1));
          break;
        case 'ArrowDown':
          this.props.dispatch(changeSelectedResult(+1));
          break;
        default:
          throw new Error('This should never happen... pls?');
      }
    }
  }

  render() {
    const {
      value,
      selectedResult,
      isExactMatch,
      dispatch,
    } = this.props;

    const {
      hasFocus,
    } = this.state;

    return (
      <div className={classnames('search', { 'search--has-focus': hasFocus })}>
        <div className="search__input-wrapper">
          <div className="search__icon-wrapper">
            <IconFromUserType
              userType={isExactMatch ? users.byId[selectedResult].type : null}
              defaultIcon={<SearchIcon />}
            />
          </div>
          <input
            id="search__input"
            onChange={event => dispatch(inputChange(event.target.value))}
            onKeyDown={this.onKeyDown}
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
  value: PropTypes.string.isRequired,
  selectedResult: PropTypes.string,
  isExactMatch: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

Search.defaultProps = {
  selectedResult: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  value: state.search.input,
  selectedResult: state.search.selectedResult,
  isExactMatch: state.search.isExactMatch,
});

export default connect(mapStateToProps)(Search);
