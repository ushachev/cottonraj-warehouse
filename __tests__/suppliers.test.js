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
      url: app.reverse('suppliers'),
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with fake authentication returns a status code of 401', async () => {
    const fakeUserToken = app.jwt.sign({ username: casual.username });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('suppliers'),
      headers: { Authorization: `Bearer ${fakeUserToken}` },
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with right authentication returns a status code of 200', async () => {
    const token = await authenticateUser(app, defaultUser);
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('suppliers'),
      headers: { Authorization: `Bearer ${token}` },
    });
    const { suppliers } = response.json();
    const received = suppliers.map((item) => pick(item, ['name', 'shortName']));

    expect(response.statusCode).toBe(200);
    expect(received).toEqual(testData.suppliers);
  });
});

describe('data mutation requests:', () => {
  beforeEach(async () => {
    await knex.migrate.latest({ directory: './__tests__/migrations' });
    await knex.seed.run({ directory: './__tests__/seeds' });
  });

  afterEach(async () => {
    await knex.migrate.rollback({ directory: './__tests__/migrations' });
  });

  test('- create with incomplete data returns a status code of 400', async () => {
    const token = await authenticateUser(app, defaultUser);
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('suppliers'),
      headers: { Authorization: `Bearer ${token}` },
      payload: { shortName: '' },
    });
    expect(response.statusCode).toBe(400);
  });

  test('- create with invalid data returns a status code of 422', async () => {
    const token = await authenticateUser(app, defaultUser);
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('suppliers'),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: 'qq' },
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- create with valid data returns a status code of 201', async () => {
    const token = await authenticateUser(app, defaultUser);
    const supplierData = { name: casual.company_name, shortName: casual.title };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('suppliers'),
      headers: { Authorization: `Bearer ${token}` },
      payload: supplierData,
    });
    const { supplier } = response.json();
    const suppliers = await models.supplier.query();

    expect(response.statusCode).toBe(201);
    expect(supplier).toEqual(expect.objectContaining(supplierData));
    expect(suppliers).toEqual(expect.arrayContaining([expect.objectContaining(supplier)]));
  });

  test('- create with non-unique data returns a status code of 422', async () => {
    const token = await authenticateUser(app, defaultUser);
    const { suppliers: [existingSupplier] } = testData;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('suppliers'),
      headers: { Authorization: `Bearer ${token}` },
      payload: existingSupplier,
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- update with incomplete data returns a status code of 400', async () => {
    const token = await authenticateUser(app, defaultUser);
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('supplier', { id: 1 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { shortName: '' },
    });

    expect(response.statusCode).toBe(400);
  });

  test('- update with invalid data returns a status code of 422', async () => {
    const token = await authenticateUser(app, defaultUser);
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('supplier', { id: 1 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: 'qq' },
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- update with authentication returns a status code of 204', async () => {
    const token = await authenticateUser(app, defaultUser);
    const supplierData = { name: casual.company_name, shortName: casual.title };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('supplier', { id: 1 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: supplierData,
    });
    const supplier = await models.supplier.query().findById(1);

    expect(response.statusCode).toBe(204);
    expect(supplier).toEqual(expect.objectContaining(supplierData));
  });

  test('- update with non-unique data returns a status code of 422', async () => {
    const token = await authenticateUser(app, defaultUser);
    const { suppliers: [existingSupplier] } = testData;
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('supplier', { id: 2 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: existingSupplier,
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });
});
