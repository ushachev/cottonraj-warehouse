import casual from 'casual';

import buildApp from './helpers/buildApp.js';
import authenticateUser from './helpers/authentication.js';
import testData from '../__fixtures__/testData.js';

const { users: [defaultUser] } = testData;

const expectedCategories = [
  {
    id: 6, name: '1,5сп', parentId: 3, children: [],
  },
  {
    id: 7, name: '1,5сп', parentId: 4, children: [],
  },
  {
    id: 5, name: '2сп', parentId: 3, children: [],
  },
  {
    id: 8, name: '2сп', parentId: 4, children: [],
  },
  {
    id: 12, name: 'Арго', parentId: 10, children: [],
  },
  {
    id: 4, name: 'Гармоника', parentId: 2, children: [7, 8],
  },
  {
    id: 13, name: 'Золотое руно', parentId: 10, children: [],
  },
  {
    id: 1, name: 'КПБ', parentId: null, children: [2],
  },
  {
    id: 11, name: 'Караван', parentId: 10, children: [],
  },
  {
    id: 14, name: 'Матрасы', parentId: null, children: [],
  },
  {
    id: 9, name: 'Одеяла', parentId: null, children: [10],
  },
  {
    id: 3, name: 'Поэтика', parentId: 2, children: [6, 5],
  },
  {
    id: 2, name: 'Экотекс', parentId: 1, children: [4, 3],
  },
  {
    id: 10, name: 'шерсть', parentId: 9, children: [12, 13, 11],
  },
];

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
  let token;

  beforeAll(async () => {
    await knex.migrate.latest({ directory: './__tests__/migrations' });
    await knex.seed.run({ directory: './__tests__/seeds' });
    token = await authenticateUser(app, defaultUser);
  });

  afterAll(async () => {
    await knex.migrate.rollback({ directory: './__tests__/migrations' });
  });

  test('- w/o authentication returns a status code of 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('categories'),
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with fake authentication returns a status code of 401', async () => {
    const fakeUserToken = app.jwt.sign({ username: casual.username });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('categories'),
      headers: { Authorization: `Bearer ${fakeUserToken}` },
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with right authentication returns a status code of 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('categories'),
      headers: { Authorization: `Bearer ${token}` },
    });
    const { categories } = response.json();

    expect(response.statusCode).toBe(200);
    expect(categories).toEqual(expectedCategories);
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

  test('- create w/o authentication returns a status code of 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('categories'),
      payload: { name: casual.title },
    });

    expect(response.statusCode).toBe(401);
  });

  test('- create with incomplete data returns a status code of 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('categories'),
      headers: { Authorization: `Bearer ${token}` },
      payload: { parentId: 1 },
    });
    expect(response.statusCode).toBe(400);
  });

  test('- create with invalid data returns a status code of 422', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('categories'),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: 'qq', parentId: 1 },
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- create with valid data returns a status code of 201', async () => {
    const categoryData = { name: casual.title };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('categories'),
      headers: { Authorization: `Bearer ${token}` },
      payload: categoryData,
    });
    const { category } = response.json();
    const categories = await models.category.query();

    expect(response.statusCode).toBe(201);
    expect(category).toEqual(expect.objectContaining(categoryData));
    expect(categories).toEqual(expect.arrayContaining([expect.objectContaining(category)]));
  });

  test('- create with non-unique data returns a status code of 422', async () => {
    const { categories: [existingCategory] } = testData;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('categories'),
      headers: { Authorization: `Bearer ${token}` },
      payload: existingCategory,
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({
      name: expect.any(Array),
      parentId: expect.any(Array),
    }));
  });

  test('- create with existing name in another category returns a status code of 201', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('categories'),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: '1,5сп', parentId: 12 },
    });

    expect(response.statusCode).toBe(201);
  });

  test('- update w/o authentication returns a status code of 401', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('category', { id: 1 }),
      payload: { name: casual.title },
    });

    expect(response.statusCode).toBe(401);
  });

  test('- update with invalid data returns a status code of 422', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('category', { id: 1 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: 'qq' },
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- update with valid data returns a status code of 204', async () => {
    const categoryData = { name: casual.title };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('category', { id: 1 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: categoryData,
    });
    const category = await models.category.query().findById(1);

    expect(response.statusCode).toBe(204);
    expect(category).toEqual(expect.objectContaining(categoryData));
  });

  test('- update with non-unique data returns a status code of 422', async () => {
    const response1 = await app.inject({
      method: 'PATCH',
      url: app.reverse('category', { id: 5 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: '1,5сп' },
    });
    const { errors: errors1 } = response1.json();

    expect(response1.statusCode).toBe(422);
    expect(errors1).toEqual(expect.objectContaining({ name: expect.any(Array) }));

    const response2 = await app.inject({
      method: 'PATCH',
      url: app.reverse('category', { id: 5 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { parentId: 4 },
    });
    const { errors: errors2 } = response2.json();

    expect(response2.statusCode).toBe(422);
    expect(errors2).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- update with existing name in another category returns a status code of 204', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('category', { id: 10 }),
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: 'Экотекс' },
    });

    expect(response.statusCode).toBe(204);
  });
});
