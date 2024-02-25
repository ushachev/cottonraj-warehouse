/* eslint-disable import/prefer-default-export */

import testData from '../../__fixtures__/testData.js';
import encrypt from '../../lib/secure.js';

const {
  users: [initialUser], suppliers, products, barcodes, categories, purchases, purchaseItems,
} = testData;

export const seed = async (knex) => {
  await knex('suppliers').truncate().insert(suppliers);
  await knex('categories').truncate().insert(categories);
  await knex('products').truncate().insert(products);
  await knex('barcodes').truncate().insert(barcodes);
  await knex('purchases').truncate().insert(purchases);
  await knex('purchaseItems').truncate().insert(purchaseItems);

  return knex('users').truncate().insert({
    username: initialUser.username,
    passwordDigest: encrypt(initialUser.password),
  });
};
