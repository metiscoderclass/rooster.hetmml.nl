import { connect } from 'react-redux';
import { type } from '../../actions';
import PresentationalSearch from '../presentational/Search';

const mapStateToProps = state => ({
  results: state.searchResults,
  value: state.searchInput,
});

const mapDispatchToProps = dispatch => ({
  onType: (event) => {
    dispatch(type(event.target.value));
  },
});

const Search = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PresentationalSearch);

export default Search;
