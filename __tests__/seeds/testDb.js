/* eslint-disable import/prefer-default-export */

import testData from '../../__fixtures__/testData.js';
import encrypt from '../../server/lib/secure.js';

const { users: [initialUser] } = testData;

export const seed = async (knex) => knex('users')
  .truncate()
  .insert({
    username: initialUser.username,
    passwordDigest: encrypt(initialUser.password),
  });
