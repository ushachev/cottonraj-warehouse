import buildApp from './helpers/buildApp.js';

describe('server main answers test:', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp();
  });

  test('GET / returns a status code of 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.statusCode).toBe(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
