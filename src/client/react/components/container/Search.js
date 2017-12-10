import { connect } from 'react-redux';
import { inputChange } from '../../actions/search';
import PresentationalSearch from '../presentational/Search';

const mapStateToProps = state => ({
  results: state.search.searchResults,
  value: state.search.searchInput,
});

const mapDispatchToProps = dispatch => ({
  onInputChange: (event) => {
    dispatch(inputChange(event.target.value));
  },
});

const Search = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PresentationalSearch);

export default Search;
