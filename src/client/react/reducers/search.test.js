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
          isExactMatch: true,
        });
      });
    });

    describe('SEARCH/INPUT_CHANGE', () => {
      it('Returns no results when nothing is typed in', () => {
        expect(search(undefined, inputChange(''))).toEqual({
          results: [],
          searchText: '',
          selectedResult: null,
          isExactMatch: false,
        });
      });

      it('Returns no results when a space is typed in', () => {
        expect(search(undefined, inputChange(' '))).toEqual({
          results: [],
          searchText: ' ',
          selectedResult: null,
          isExactMatch: false,
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
          isExactMatch: false,
        });
      });

      it('Selects the first result and sets isExactMatch to true when there is an exact match', () => {
        expect(search(undefined, inputChange('18561'))).toEqual({
          results: [
            's/18561',
          ],
          searchText: '18561',
          selectedResult: 's/18561',
          isExactMatch: true,
        });
      });
    });

    describe('SEARCH/CHANGE_SELECTED_RESULT', () => {
      it('Does nothing when there are no results', () => {
        const prevState = {
          results: [],
          searchText: '',
          selectedResult: null,
          isExactMatch: false,
        };

        const actionPlus = changeSelectedResult(+1);
        const actionMin = changeSelectedResult(-1);

        deepFreeze([prevState, actionPlus, actionMin]);

        const nextStatePlus = search(prevState, actionPlus);
        const nextStateMin = search(prevState, actionMin);
        expect(nextStatePlus).toEqual(prevState);
        expect(nextStateMin).toEqual(prevState);
      });

      it('Does nothing when there is an exact match', () => {
        const prevState = {
          results: ['s/18561'],
          searchText: '18561',
          selectedResult: 's/18561',
          isExactMatch: true,
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
          isExactMatch: false,
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
          isExactMatch: false,
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

      it('Properly wraps arround when incrementing', () => {
        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18563',
          isExactMatch: false,
        }, changeSelectedResult(+1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
          isExactMatch: false,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
          isExactMatch: false,
        }, changeSelectedResult(+1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18561',
          isExactMatch: false,
        });
      });

      it('Properly wraps arround when decrementing', () => {
        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18561',
          isExactMatch: false,
        }, changeSelectedResult(-1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
          isExactMatch: false,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
          isExactMatch: false,
        }, changeSelectedResult(-1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18563',
          isExactMatch: false,
        });
      });
    });
  });
});
