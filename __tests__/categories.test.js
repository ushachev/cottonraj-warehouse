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

beforeAll(async () => {
  app = await buildApp();
  knex = app.objection.knex;
});

afterAll(async () => {
  await app.close();
});

describe('data read requests:', () => {
  let token;

  beforeAll(async () => {
    await knex.migrate.latest();
    await knex.seed.run({ directory: './__tests__/seeds' });
    token = await authenticateUser(app, defaultUser);
  });

  afterAll(async () => {
    await knex.migrate.rollback();
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
