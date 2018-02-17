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

export const setUser = user => ({
  type: 'SEARCH/SET_USER',
  user,
});

export const inputChange = searchText => ({
  type: 'SEARCH/INPUT_CHANGE',
  searchText,
});

/**
 * Change the selected result.
 * @param {+1/-1} relativeChange usually +1 or -1, the change relative to the
 *     current result.
 */
export const changeSelectedResult = relativeChange => ({
  type: 'SEARCH/CHANGE_SELECTED_RESULT',
  relativeChange,
});
