/**
 * Copyright (C) 2018 Noah Loomans
 *
 * This file is part of rooster.hetmml.nl.
 *
 * rooster.hetmml.nl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * rooster.hetmml.nl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with rooster.hetmml.nl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
const reducer = require('./reducers').default;
const { DEFAULT_STATE } = require('./reducers')._test;

describe('reducers', () => {
  beforeAll(() => {
    deepFreeze(DEFAULT_STATE);
  });

  describe('SEARCH/SET_USER', () => {
    it('Resets the search state if the user is null', () => {
      const prevState = { search: { foo: 'bar' } };
      const action = { type: 'SEARCH/SET_USER', user: null };

      deepFreeze([prevState, action]);

      expect(reducer(prevState, action)).toEqual({
        search: DEFAULT_STATE.search,
      });
    });

    it('Sets all the values of that user properly', () => {
      expect(reducer(undefined, { type: 'SEARCH/SET_USER', user: 's/18561' })).toEqual({
        ...DEFAULT_STATE,
        search: {
          results: [],
          text: '18561',
          selected: 's/18561',
        },
      });
    });
  });

  describe('SEARCH/INPUT_CHANGE', () => {
    describe('searchText is empty or whitespace-only', () => {
      it('Returns no results', () => {
        ['', ' ', '\t'].forEach((searchText) => {
          const prevState = undefined;
          const action = { type: 'SEARCH/INPUT_CHANGE', searchText };
          deepFreeze([prevState, action]);
          const nextState = reducer(prevState, action);

          expect(nextState).toEqual({
            ...DEFAULT_STATE,
            search: {
              results: [],
              text: searchText,
              selected: null,
            },
          });
        });
      });
    });

    describe('searchText is 18', () => {
      let nextState;
      beforeAll(() => {
        const prevState = undefined;
        const action = { type: 'SEARCH/INPUT_CHANGE', searchText: '18' };
        deepFreeze([prevState, action]);
        nextState = reducer(prevState, action);
      });

      it('Only returns 4 results', () => {
        expect(nextState.search.results).toHaveLength(4);
      });

      it('Selects the first result', () => {
        expect(nextState.search.selected).toEqual('s/18561');
      });

      it('Copies the searchText over to state.search.text', () => {
        expect(nextState.search.text).toEqual('18');
      });
    });
  });

  describe('SEARCH/CHANGE_SELECTED_RESULT', () => {
    describe('State has no results', () => {
      it('Does nothing', () => {
        const actionPlus = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 };
        const actionMin = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 };

        deepFreeze([actionPlus, actionMin]);

        const nextStatePlus = reducer(DEFAULT_STATE, actionPlus);
        const nextStateMin = reducer(DEFAULT_STATE, actionMin);
        expect(nextStatePlus).toEqual(DEFAULT_STATE);
        expect(nextStateMin).toEqual(DEFAULT_STATE);
      });
    });

    describe('State has many results', () => {
      it('Switches to the correct selectedResult', () => {
        const prevState = {
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18562',
          },
        };

        const actionPlus = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 };
        const actionMin = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 };

        deepFreeze([prevState, actionPlus, actionMin]);

        const nextStatePlus = reducer(prevState, actionPlus);
        const nextStateMin = reducer(prevState, actionMin);

        expect(nextStatePlus).toEqual({
          ...prevState,
          search: {
            ...prevState.search,
            selected: 's/18563',
          },
        });
        expect(nextStateMin).toEqual({
          ...prevState,
          search: {
            ...prevState.search,
            selected: 's/18561',
          },
        });
      });

      it('Properly wraps around when incrementing', () => {
        expect(reducer({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18563',
          },
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 })).toEqual({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18561',
          },
        });

        expect(reducer({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18563',
          },
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 })).toEqual({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18561',
          },
        });
      });

      it('Properly wraps around when decrementing', () => {
        expect(reducer({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18561',
          },
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 })).toEqual({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18563',
          },
        });

        expect(reducer({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: null,
          },
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 })).toEqual({
          ...DEFAULT_STATE,
          search: {
            results: ['s/18561', 's/18562', 's/18563'],
            text: '1856',
            selected: 's/18563',
          },
        });
      });
    });
  });
});
