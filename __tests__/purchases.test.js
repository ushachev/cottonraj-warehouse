import casual from 'casual';
import { pick } from 'lodash';

import buildApp from './helpers/buildApp.js';
import authenticateUser from './helpers/authentication.js';
import testData from '../__fixtures__/testData.js';

const { users: [defaultUser], products } = testData;

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
    await knex.migrate.latest();
    await knex.seed.run({ directory: './__tests__/seeds' });
  });

  afterAll(async () => {
    await knex.migrate.rollback();
  });

  test('- w/o authentication returns a status code of 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('purchases'),
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with fake authentication returns a status code of 401', async () => {
    const fakeUserToken = app.jwt.sign({ username: casual.username });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${fakeUserToken}` },
    });
    expect(response.statusCode).toBe(401);
  });

  test('- with right authentication returns a status code of 200', async () => {
    const token = await authenticateUser(app, defaultUser);
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
    });
    const { purchases } = response.json();
    const received = purchases.map((item) => pick(item, [
      'number', 'date', 'supplierId', 'supplier', 'items',
    ]));
    const expected = [
      {
        ...testData.purchases[0],
        supplier: testData.suppliers[0],
        items: testData.purchaseItems.map(({
          number, count, price, productId,
        }) => ({
          number,
          count,
          price,
          product: { name: testData.products[productId - 1].name },
        })),
      },
    ];

    expect(response.statusCode).toBe(200);
    expect(received).toEqual(expected);
  });
});

describe('data mutation requests:', () => {
  let token;

  beforeEach(async () => {
    await knex.migrate.latest();
    await knex.seed.run({ directory: './__tests__/seeds' });
    token = await authenticateUser(app, defaultUser);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  test('- create with incomplete data returns a status code of 400', async () => {
    const response1 = await app.inject({
      method: 'POST',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
      payload: { number: casual.integer(1) },
    });
    const response2 = await app.inject({
      method: 'POST',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        number: casual.integer(1),
        date: casual.date(),
        supplierId: 1,
        items: [],
      },
    });

    expect(response1.statusCode).toBe(400);
    expect(response2.statusCode).toBe(400);
  });

  test('- create with invalid data returns a status code of 422', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        number: casual.integer(1),
        date: casual.date(),
        supplierId: 1,
        items: [{
          number: 'a',
          productId: null,
          product: { name: casual.description },
          count: 0,
          price: 100,
        }],
      },
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({
      'items[0].number': expect.any(Array),
      'items[0].count': expect.any(Array),
    }));
  });

  test('- create with valid data returns a status code of 201', async () => {
    const productName = casual.description;
    const barcodeValue = casual.array_of_digits(13).join('');
    const purchaseData = {
      number: String(casual.integer(1)),
      date: casual.date(),
      supplierId: 1,
      items: [
        {
          number: 1,
          productId: null,
          product: {
            name: productName,
            barcodes: [barcodeValue],
          },
          count: 1,
          price: 100,
        },
        {
          number: 2,
          productId: 1,
          product: products[0],
          count: 1,
          price: 200,
        },
      ],
    };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
      payload: purchaseData,
    });
    const purchase = await models.purchase.query().findOne({ number: purchaseData.number });
    const product = await models.product.query().findOne({ name: productName });
    const barcodes = await models.barcode.query();
    const purchaseItems = await models.purchaseItem.query();

    expect(response.statusCode).toBe(201);
    expect(purchase)
      .toEqual(expect.objectContaining(pick(purchaseData, ['number', 'date', 'supplierId'])));
    expect(product).toEqual(expect.objectContaining({ name: productName }));
    expect(barcodes).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: barcodeValue }),
    ]));
    expect(purchaseItems).toEqual(expect.arrayContaining(purchaseData.items
      .map((item) => expect.objectContaining({
        ...pick(item, ['number', 'count', 'price']),
        purchaseId: purchase.id,
        productId: item.productId || product.id,
      }))));
  });

  test('- create with non-unique data returns a status code of 422', async () => {
    const purchaseData = {
      number: String(casual.integer(1)),
      date: casual.date(),
      supplierId: 1,
      items: [
        {
          number: 1,
          productId: null,
          product: products[0],
          count: 1,
          price: 100,
        },
      ],
    };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
      payload: purchaseData,
    });
    const { errors } = response.json();

    expect(response.statusCode).toBe(422);
    expect(errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
  });

  test('- create with non-unique number on another date returns a status code of 201', async () => {
    const { purchases: [testPurchase] } = testData;
    const purchaseData = {
      number: testPurchase.number,
      date: casual.date(),
      supplierId: 1,
      items: [
        {
          number: 1,
          productId: 1,
          product: products[0],
          count: 1,
          price: 100,
        },
      ],
    };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
      payload: purchaseData,
    });

    expect(response.statusCode).toBe(201);
  });

  test('- create with non-unique number/date returns a status code of 422', async () => {
    const { purchases: [testPurchase] } = testData;
    const purchaseData = {
      number: testPurchase.number,
      date: testPurchase.date,
      supplierId: 1,
      items: [
        {
          number: 1,
          productId: 1,
          product: products[0],
          count: 1,
          price: 100,
        },
      ],
    };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('purchases'),
      headers: { Authorization: `Bearer ${token}` },
      payload: purchaseData,
    });

    expect(response.statusCode).toBe(422);
  });
});
