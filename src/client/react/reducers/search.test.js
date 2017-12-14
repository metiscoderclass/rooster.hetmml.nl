window.USERS = [];

const deepFreeze = require('deep-freeze');
const search = require('./search').default;
const { changeSelectedResult } = require('../actions/search');

describe('reducers', () => {
  describe('search', () => {
    describe('SEARCH/CHANGE_SELECTED_RESULT', () => {
      it('Does nothing when there are no results', () => {
        const prevState = {
          results: [],
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
          selectedResult: 's/18563',
          isExactMatch: false,
        }, changeSelectedResult(+1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          selectedResult: null,
          isExactMatch: false,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          selectedResult: null,
          isExactMatch: false,
        }, changeSelectedResult(+1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          selectedResult: 's/18561',
          isExactMatch: false,
        });
      });

      it('Properly wraps arround when decrementing', () => {
        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          selectedResult: 's/18561',
          isExactMatch: false,
        }, changeSelectedResult(-1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          selectedResult: null,
          isExactMatch: false,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          selectedResult: null,
          isExactMatch: false,
        }, changeSelectedResult(-1))).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          selectedResult: 's/18563',
          isExactMatch: false,
        });
      });
    });
  });
});
