export default {
  users: [
    {
      username: 'user',
      password: 'password',
    },
  ],
  suppliers: [
    {
      name: 'ИП Пупкин Василий',
      shortName: 'ИП Пупкин',
    },
    {
      name: 'OOO "Рога и копыта"',
      shortName: 'Рога и копыта',
    },
  ],
  products: [
    {
      name: 'Подушка бамбук 70х70',
    },
    {
      name: 'Одеяло шерсть 172х205',
    },
    {
      name: 'Полотенце 70х130',
    },
  ],
  barcodes: [
    {
      value: '0000000000000',
      productId: 1,
    },
    {
      value: '1111111111111',
      productId: 2,
    },
    {
      value: '2222222222222',
      productId: 2,
    },
  ],
  purchases: [
    {
      number: 'A-1',
      date: '2022-03-20',
      supplierId: 1,
    },
  ],
  purchaseItems: [
    {
      purchaseId: 1,
      number: 1,
      productId: 1,
      count: 2,
      price: 10000,
    },
    {
      purchaseId: 1,
      number: 2,
      productId: 2,
      count: 1,
      price: 100000,
    },
  ],
};
