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

const Search = ({
  onInputChange,
  onFocus,
  onBlur,
  hasFocus,
  value,
  exactMatch,
}) => (
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
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
    <Results />
  </div>
);

Search.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  hasFocus: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  exactMatch: PropTypes.shape(userShape),
};

Search.defaultProps = {
  exactMatch: null,
};

const mapStateToProps = state => ({
  results: state.search.results,
  value: state.search.input,
  hasFocus: state.search.hasFocus,
  exactMatch: state.search.exactMatch,
});

const mapDispatchToProps = dispatch => ({
  onInputChange: (event) => {
    dispatch(inputChange(event.target.value));
  },
  onFocus: () => {
    dispatch(focusChange(true));
    document.querySelector('#search__input').select();
  },
  onBlur: () => {
    dispatch(focusChange(false));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
