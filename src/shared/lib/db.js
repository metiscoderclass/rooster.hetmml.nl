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

const { Pool } = require('pg');

const pool = new Pool({
  database: process.env.PGDATABASE || 'rooster_hetmml_nl',
});

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (error) => {
  console.error('Unexpected error on idle client', error);
  // TODO: Do we want to exit here?
  process.exit(-1);
});

async function insertUsers(users) {
  await pool.query('TRUNCATE TABLE schedule_user');
  const promises = users.map(user => (
    pool.query(
      'INSERT INTO schedule_user(key, type, name, alt_name, index) VALUES ($1, $2, $3, $4, $5)',
      [user.key, user.type, user.name, user.altName, user.index],
    )
  ));
  await Promise.all(promises);
}

async function getUsers() {
  const { rows } = await pool.query(
    'SELECT key, type, name, alt_name, index FROM schedule_user',
  );

  const users = rows.map(row => ({
    key: row.key,
    type: row.type,
    name: row.name,
    altName: row.altName,
    index: row.index,
  }));

  return users;
}

module.exports = { insertUsers, getUsers };
