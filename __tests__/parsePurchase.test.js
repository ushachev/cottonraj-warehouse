import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import buildApp from './helpers/buildApp.js';
import authenticateUser from './helpers/authentication.js';
import testData from '../__fixtures__/testData.js';

const { users: [defaultUser] } = testData;
const expectedParsedData = {
  supplier: 'ИП Пупкин В. А., ИНН 0000000000',
  number: 'К-82',
  date: '2022-02-10',
  products: [
    {
      number: 1,
      productId: 1,
      name: 'Подушка бамбук 70х70',
      count: 2,
      price: 75516,
      barcodes: ['0000000000000'],
    },
    {
      number: 2,
      productId: 2,
      name: 'Одеяло шерсть 172х205',
      count: 1,
      price: 67116,
      barcodes: [],
    },
    {
      number: 3,
      productId: 3,
      name: 'Полотенце 70х130',
      count: 5,
      price: 10022,
      barcodes: ['3333333333333'],
    },
    {
      number: 4,
      productId: null,
      name: 'КПБ бязь 1,5сп',
      count: 1,
      price: 200096,
      barcodes: ['4444444444444', '5555555555555'],
    },
  ],
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => join(__dirname, '..', '__fixtures__', filename);

let app;
let token;

beforeAll(async () => {
  app = await buildApp();
  await app.objection.knex.migrate.latest();
  await app.objection.knex.seed.run({ directory: './__tests__/seeds' });
  token = await authenticateUser(app, defaultUser);
});

afterAll(async () => {
  await app.objection.knex.migrate.rollback();
  await app.close();
});

test('- send nonXML data returns a status code of 400', async () => {
  const response = await app.inject({
    method: 'POST',
    url: app.reverse('parsePurchase'),
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'text/xml',
    },
    payload: { foo: 'bar' },
  });

  expect(response.statusCode).toBe(400);
});

test('- send XML w/o needed data returns a status code of 422', async () => {
  const response = await app.inject({
    method: 'POST',
    url: app.reverse('parsePurchase'),
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'text/xml',
    },
    payload: `<?xml version="1.0" encoding="WINDOWS-1251"?>
      <Файл>
        <foo>bar</foo>
      </Файл>
    `,
  });

  expect(response.statusCode).toBe(422);
});

test('- send XML doc with code 1115131 returns a status code of 200', async () => {
  const response = await app.inject({
    method: 'POST',
    url: app.reverse('parsePurchase'),
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'text/xml',
    },
    payload: fs.readFileSync(getFixturePath('purchase_1115131.xml'), 'utf8'),
  });
  const parsedData = response.json();

  expect(response.statusCode).toBe(200);
  expect(parsedData).toEqual(expectedParsedData);
});

test('- send XML doc with code 1175010 returns a status code of 200', async () => {
  const response = await app.inject({
    method: 'POST',
    url: app.reverse('parsePurchase'),
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'text/xml',
    },
    payload: fs.readFileSync(getFixturePath('purchase_1175010.xml'), 'utf8'),
  });
  const parsedData = response.json();

  expect(response.statusCode).toBe(200);
  expect(parsedData).toEqual(expectedParsedData);
});
