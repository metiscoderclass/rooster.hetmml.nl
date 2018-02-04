import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';

import SearchIcon from 'react-icons/lib/md/search';

import { userFromMatch } from '../../lib/url';
import { setUser, inputChange, changeSelectedResult } from '../../actions/search';

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

  componentDidMount() {
    const urlUser = userFromMatch(this.props.match);
    this.props.dispatch(setUser(urlUser));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match !== this.props.match) {
      const urlUser = userFromMatch(nextProps.match);
      this.props.dispatch(setUser(urlUser));
    }
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
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault();
      switch (event.key) {
        case 'ArrowUp':
          this.props.dispatch(changeSelectedResult(-1));
          break;
        case 'ArrowDown':
          this.props.dispatch(changeSelectedResult(+1));
          break;
        case 'Enter': {
          const result = this.props.selectedResult || this.props.results[0];
          const urlUser = userFromMatch(this.props.match);

          if (result === urlUser) {
            // EDGE CASE: The user is set if the user changes, but it doesn't
            // change if the result is already the one we are viewing.
            // Therefor, we need to dispatch the SET_USER command manually.
            this.props.dispatch(setUser(urlUser));
          } else if (result) {
            this.props.history.push(`/${result}`);
          }
          break;
        }
        default:
          throw new Error('This should never happen... pls?');
      }
    }
  }

  render() {
    const {
      searchText,
      match,
      dispatch,
    } = this.props;

    const {
      hasFocus,
    } = this.state;

    const urlUser = userFromMatch(match);

    const isExactMatch =
      urlUser != null &&
      searchText === users.byId[urlUser].value;

    return (
      <div className="search">
        <div className={classnames('search-overflow', { 'search--has-focus': hasFocus })}>
          <div className="search__input-wrapper">
            <div className="search__icon-wrapper">
              <IconFromUserType
                userType={isExactMatch ? users.byId[urlUser].type : null}
                defaultIcon={<SearchIcon />}
              />
            </div>
            <input
              id="search__input"
              onChange={event => dispatch(inputChange(event.target.value))}
              onKeyDown={this.onKeyDown}
              value={searchText}
              placeholder="Zoeken"
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              autoComplete="off"
            />
          </div>
          <Results />
        </div>
      </div>
    );
  }
}

Search.propTypes = {
  results: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedResult: PropTypes.string,
  searchText: PropTypes.string.isRequired,

  // react-router
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,

  // redux
  dispatch: PropTypes.func.isRequired,
};

Search.defaultProps = {
  selectedResult: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  searchText: state.search.searchText,
  selectedResult: state.search.selectedResult,
  isExactMatch: state.search.isExactMatch,
});

export default withRouter(connect(mapStateToProps)(Search));
