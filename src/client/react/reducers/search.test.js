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
const search = require('./search').default;
const { _test } = require('./search');

describe('reducers', () => {
  describe('search', () => {
    describe('SEARCH/SET_USER', () => {
      it('Resets to the default state if the user is null', () => {
        expect(search({ foo: 'bar' }, { type: 'SEARCH/SET_USER', user: null })).toEqual(_test.DEFAULT_STATE);
      });

      it('Sets all the values of that user properly', () => {
        expect(search(undefined, { type: 'SEARCH/SET_USER', user: 's/18561' })).toEqual({
          results: [],
          searchText: '18561',
          selectedResult: 's/18561',
        });
      });
    });

    describe('SEARCH/INPUT_CHANGE', () => {
      it('Returns no results when nothing is typed in', () => {
        expect(search(undefined, { type: 'SEARCH/INPUT_CHANGE', searchText: '' })).toEqual({
          results: [],
          searchText: '',
          selectedResult: null,
        });
      });

      it('Returns no results when a space is typed in', () => {
        expect(search(undefined, { type: 'SEARCH/INPUT_CHANGE', searchText: ' ' })).toEqual({
          results: [],
          searchText: ' ',
          selectedResult: null,
        });
      });

      it('Preforms a basic search, only returning four results', () => {
        expect(search(undefined, { type: 'SEARCH/INPUT_CHANGE', searchText: '18' })).toEqual({
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

        const actionPlus = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 };
        const actionMin = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 };

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

        const actionPlus = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 };
        const actionMin = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 };

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

        const actionPlus = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 };
        const actionMin = { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 };

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
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 })).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: +1 })).toEqual({
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
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 })).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        });

        expect(search({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: null,
        }, { type: 'SEARCH/CHANGE_SELECTED_RESULT', relativeChange: -1 })).toEqual({
          results: ['s/18561', 's/18562', 's/18563'],
          searchText: '1856',
          selectedResult: 's/18563',
        });
      });
    });
  });
});
