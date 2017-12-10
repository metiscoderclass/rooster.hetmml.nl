import { connect } from 'react-redux';
import { inputChange, focusChange } from '../../actions/search';
import PresentationalSearch from '../presentational/Search';

const mapStateToProps = state => ({
  results: state.search.searchResults,
  value: state.search.searchInput,
  hasFocus: state.search.hasFocus,
  exactMatch: state.search.exactMatch,
});

const mapDispatchToProps = dispatch => ({
  onInputChange: (event) => {
    dispatch(inputChange(event.target.value));
  },
  onFocus: () => {
    dispatch(focusChange(true));
  },
  onBlur: () => {
    dispatch(focusChange(false));
  },
});

const Search = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PresentationalSearch);

export default Search;
