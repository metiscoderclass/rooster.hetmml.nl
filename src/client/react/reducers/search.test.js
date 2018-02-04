window.USERS = [
  { type: 's', value: '18561' },
  { type: 's', value: '18562' },
  { type: 's', value: '18563' },
  { type: 's', value: '18564' },
  { type: 's', value: '18565' },
  { type: 's', value: '18566' },
  { type: 's', value: '18567' },
  { type: 's', value: '18568' },
  { type: 's', value: '18569' },
];

const deepFreeze = require('deep-freeze');
const search = require('./search').default;
const { _test } = require('./search');
const {
  setUser,
  inputChange,
  changeSelectedResult,
} = require('../actions/search');

describe('reducers', () => {
  describe('search', () => {
    describe('SEARCH/SET_USER', () => {
      it('Resets to the default state if the user is null', () => {
        expect(search({ foo: 'bar' }, setUser(null))).toEqual(_test.DEFAULT_STATE);
      });

      it('Sets all the values of that user properly', () => {
        expect(search(undefined, setUser('s/18561'))).toEqual({
          results: [],
          searchText: '18561',
          selectedResult: 's/18561',
        });
      });
    });

    describe('SEARCH/INPUT_CHANGE', () => {
      it('Returns no results when nothing is typed in', () => {
        expect(search(undefined, inputChange(''))).toEqual({
          results: [],
          searchText: '',
          selectedResult: null,
        });
      });

      it('Returns no results when a space is typed in', () => {
        expect(search(undefined, inputChange(' '))).toEqual({
          results: [],
          searchText: ' ',
          selectedResult: null,
        });
      });

      it('Preforms a basic search, only returning four results', () => {
        expect(search(undefined, inputChange('18'))).toEqual({
          results: [
            's/18561',
            's/18562',
            's/18563',
            's/18564',
          ],
          searchText: '18',
          selectedResult: null,
        });
      });
    });

    describe('SEARCH/CHANGE_SELECTED_RESULT', () => {
      it('Does nothing when there are no results', () => {
        const prevState = {
          results: [],
          searchText: '',
          selectedResult: null,
        };

        const actionPlus = changeSelectedResult(+1);
        const actionMin = changeSelectedResult(-1);

        deepFreeze([prevState, actionPlus, actionMin]);

        const nextStatePlus = search(prevState, actionPlus);
        const nextStateMin = search(prevState, actionMin);
        expect(nextStatePlus).toEqual(prevState);
        expect(nextStateMin).toEqual(prevState);
      });

      it('Switches to the correct selectedResult when no selected result is selected', () => {
        const prevState = {
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        };

        const actionPlus = changeSelectedResult(+1);
        const actionMin = changeSelectedResult(-1);

        deepFreeze([prevState, actionPlus, actionMin]);

        const nextStatePlus = search(prevState, actionPlus);
        const nextStateMin = search(prevState, actionMin);

        expect(nextStatePlus).toEqual({
          ...prevState,
          selectedResult: 's/18561',
        });
        expect(nextStateMin).toEqual({
          ...prevState,
          selectedResult: 's/18563',
        });
      });

      it('Switches to the correct selectedResult when there is a selected result selected', () => {
        const prevState = {
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18562',
        };

        const actionPlus = changeSelectedResult(+1);
        const actionMin = changeSelectedResult(-1);

        deepFreeze([prevState, actionPlus, actionMin]);

        const nextStatePlus = search(prevState, actionPlus);
        const nextStateMin = search(prevState, actionMin);

        expect(nextStatePlus).toEqual({
          ...prevState,
          selectedResult: 's/18563',
        });
        expect(nextStateMin).toEqual({
          ...prevState,
          selectedResult: 's/18561',
        });
      });

      it('Properly wraps around when incrementing', () => {
        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18563',
        }, changeSelectedResult(+1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        }, changeSelectedResult(+1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18561',
        });
      });

      it('Properly wraps around when decrementing', () => {
        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18561',
        }, changeSelectedResult(-1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        }, changeSelectedResult(-1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18563',
        });
      });
    });
  });
});
