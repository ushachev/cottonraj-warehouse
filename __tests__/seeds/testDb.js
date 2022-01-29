/* eslint-disable import/prefer-default-export */

import testData from '../../__fixtures__/testData.js';
import encrypt from '../../server/lib/secure.js';

const { users: [initialUser], suppliers } = testData;

export const seed = async (knex) => {
  await knex('users').truncate().insert({
    username: initialUser.username,
    passwordDigest: encrypt(initialUser.password),
  });

  return knex('suppliers').truncate().insert(suppliers);
};
