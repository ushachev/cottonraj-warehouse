/* eslint-disable import/prefer-default-export */

import testData from '../../__fixtures__/testData.js';
import encrypt from '../../server/lib/secure.js';

const {
  users: [initialUser], suppliers, products, barcodes,
} = testData;

export const seed = async (knex) => {
  await knex('suppliers').truncate().insert(suppliers);
  await knex('products').truncate().insert(products);
  await knex('barcodes').truncate().insert(barcodes);

  return knex('users').truncate().insert({
    username: initialUser.username,
    passwordDigest: encrypt(initialUser.password),
  });
};
