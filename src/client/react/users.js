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

/* global USERS */

import keyBy from 'lodash/keyBy';

const getId = ({ type, value }) => `${type}/${value}`;

const users = {};

users.allUsers = USERS.map(user => ({
  type: user.type,
  value: user.value,
  alt: user.alt,
  id: getId(user),
}));

users.allRooms = users.allUsers.filter(user => user.type === 'r');
users.allStudents = users.allUsers.filter(user => user.type === 's');
users.allTeachers = users.allUsers.filter(user => user.type === 't');
users.allClasses = users.allUsers.filter(user => user.type === 'c');

users.allIds = users.allUsers.map(user => user.id);
users.allRoomIds = users.allRooms.map(user => user.id);
users.allStudentIds = users.allStudents.map(user => user.id);
users.allTeacherIds = users.allTeachers.map(user => user.id);
users.allClassIds = users.allClasses.map(user => user.id);

users.byId = keyBy(users.allUsers, 'id');

export default users;
