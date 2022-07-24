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
      categoryId: 10,
    },
    {
      name: 'Полотенце 70х130',
    },
    {
      name: 'Подушка шерсть 50х70',
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
  categories: [
    {
      name: 'КПБ',
    },
    {
      name: 'Экотекс',
      parentId: 1,
    },
    {
      name: 'Поэтика',
      parentId: 2,
    },
    {
      name: 'Гармоника',
      parentId: 2,
    },
    {
      name: '2сп',
      parentId: 3,
    },
    {
      name: '1,5сп',
      parentId: 3,
    },
    {
      name: '1,5сп',
      parentId: 4,
    },
    {
      name: '2сп',
      parentId: 4,
    },
    {
      name: 'Одеяла',
    },
    {
      name: 'шерсть',
      parentId: 9,
    },
    {
      name: 'Караван',
      parentId: 10,
    },
    {
      name: 'Арго',
      parentId: 10,
    },
    {
      name: 'Золотое руно',
      parentId: 10,
    },
    {
      name: 'Подушки',
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
