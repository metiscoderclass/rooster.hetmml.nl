import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as classnames from 'classnames';

import SearchIcon = require('react-icons/lib/md/search');

import { inputChange, changeSelectedResult } from '../../actions/search';
import { Action } from '../../reducers/search';
import { State } from '../../reducers';

import users from '../../users';
import Results from './Results';
import IconFromUserType from '../presentational/IconFromUserType';

interface SearchStateProps {
  selectedResult: string | null,
  isExactMatch: boolean,
}

interface SearchDispatchProps {
  changeSelectedResult(relativeChange: 1 | -1): void,
  inputChange(typedValue: string): void,
}

class Search extends React.Component<SearchStateProps & SearchDispatchProps, any> {
  constructor(props: SearchStateProps & SearchDispatchProps) {
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

  onKeyDown(event: React.KeyboardEvent<any>) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      switch (event.key) {
        case 'ArrowUp':
          this.props.changeSelectedResult(-1);
          break;
        case 'ArrowDown':
          this.props.changeSelectedResult(+1);
          break;
        default:
          throw new Error('This should never happen... pls?');
      }
    }
  }

  render() {
    const {
      selectedResult,
      isExactMatch,
      inputChange,
    } = this.props;

    const {
      hasFocus,
    } = this.state;

    return (
      <div className={classnames('search', { 'search--has-focus': hasFocus })}>
        <div className="search__input-wrapper">
          <div className="search__icon-wrapper">
            <IconFromUserType
              userType={(selectedResult && isExactMatch) ? users.byId[selectedResult].type : undefined}
              defaultIcon={<SearchIcon />}
            />
          </div>
          <input
            id="search__input"
            onChange={event => inputChange(event.target.value)}
            onKeyDown={this.onKeyDown}
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

const mapStateToProps = (state: State):SearchStateProps => ({
  selectedResult: state.search.selectedResult,
  isExactMatch: state.search.isExactMatch,
});

const mapDispatchToProps = (dispatch: any): SearchDispatchProps => ({
  inputChange(typedValue) {
    dispatch(inputChange(typedValue));
  },
  changeSelectedResult(relativeChange) {
    dispatch(changeSelectedResult(relativeChange))
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
