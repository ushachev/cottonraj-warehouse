import casual from 'casual';
import { pick } from 'lodash';

import buildApp from './helpers/buildApp.js';
import authenticateUser from './helpers/authentication.js';
import testData from '../__fixtures__/testData.js';

const { users: [defaultUser] } = testData;

let app;
let knex;
let models;

beforeAll(async () => {
  app = await buildApp();
  knex = app.objection.knex;
  models = app.objection.models;
});

afterAll(async () => {
  await app.close();
});

describe('data read requests:', () => {
  beforeAll(async () => {
    await knex.migrate.latest({ directory: './__tests__/migrations' });
    await knex.seed.run({ directory: './__tests__/seeds' });
  });

  afterAll(async () => {
    await knex.migrate.rollback({ directory: './__tests__/migrations' });
  });

  test('- w/o authentication returns a status code of 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('products'),
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with fake authentication returns a status code of 401', async () => {
    const fakeUserToken = app.jwt.sign({ username: casual.username });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('products'),
      headers: { Authorization: `Bearer ${fakeUserToken}` },
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with right authentication returns a status code of 200', async () => {
    const token = await authenticateUser(app, defaultUser);
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('products'),
      headers: { Authorization: `Bearer ${token}` },
    });
    const { products } = response.json();
    const received = products.map((item) => pick(item, ['name', 'barcodes', 'categoryId']));
    const expected = testData.products
      .map(({ name, categoryId = null }, idx) => ({
        name,
        barcodes: testData.barcodes
          .filter(({ productId }) => productId === idx + 1)
          .map(({ value }) => value),
        categoryId,
      }))
      .sort(({ name: a }, { name: b }) => a.localeCompare(b));

    expect(response.statusCode).toBe(200);
    expect(received).toEqual(expected);
  });
});

describe('data mutation requests:', () => {
  let token;

  beforeEach(async () => {
    await knex.migrate.latest({ directory: './__tests__/migrations' });
    await knex.seed.run({ directory: './__tests__/seeds' });
    token = await authenticateUser(app, defaultUser);
  });

  afterEach(async () => {
    await knex.migrate.rollback({ directory: './__tests__/migrations' });
  });

  test('- update w/o authentication returns a status code of 401', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('product', { id: 1 }),
      payload: { name: casual.title },
    });

    expect(response.statusCode).toBe(401);
  });

  test('- update with invalid data returns a status code of 422', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('product', { id: 1 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: 'qqq' },
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- update with valid data returns a status code of 204', async () => {
    const productData = { name: casual.title, categoryId: 1 };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('product', { id: 1 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: productData,
    });
    const product = await models.product.query().findById(1);

    expect(response.statusCode).toBe(204);
    expect(product).toEqual(expect.objectContaining(productData));
  });

  test('- update with non-unique data returns a status code of 422', async () => {
    const { products: [existingProduct] } = testData;
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('product', { id: 2 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: existingProduct.name },
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });
});
