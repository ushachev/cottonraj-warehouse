import casual from 'casual';
import { pick } from 'lodash';

import buildApp from './helpers/buildApp.js';
import authenticateUser from './helpers/authentication.js';
import testData from '../__fixtures__/testData.js';

const { users: [defaultUser] } = testData;

let app;
let knex;

beforeAll(async () => {
  app = await buildApp();
  knex = app.objection.knex;
});

afterAll(async () => {
  await app.close();
});

describe('data read requests:', () => {
  beforeAll(async () => {
    await knex.migrate.latest();
    await knex.seed.run({ directory: './__tests__/seeds' });
  });

  afterAll(async () => {
    await knex.migrate.rollback();
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
    const received = products.map((item) => pick(item, ['name', 'barcodes']));
    const expected = testData.products.map(({ name }, idx) => ({
      name,
      barcodes: testData.barcodes
        .filter(({ productId }) => productId === idx + 1)
        .map(({ value }) => value),
    }));

    expect(response.statusCode).toBe(200);
    expect(received).toEqual(expected);
  });
});
