import buildApp from './helpers/buildApp.js';
import testData from '../__fixtures__/testData.js';

const { users: [defaultUser] } = testData;

describe('login route test:', () => {
  let app;
  let knex;

  beforeAll(async () => {
    app = await buildApp();
    knex = app.objection.knex;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await knex.seed.run({ directory: './__tests__/seeds' });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  test('- login with registered user returns a status code of 200', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('login'),
      payload: defaultUser,
    });
    expect(response.statusCode).toBe(200);
  });

  test('- login with incorrect password returns a status code of 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('login'),
      payload: { ...defaultUser, password: 'qwerty' },
    });
    expect(response.statusCode).toBe(401);
  });

  test('- login with invalid data returns a status code of 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('login'),
      payload: { password: '' },
    });
    expect(response.statusCode).toBe(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
