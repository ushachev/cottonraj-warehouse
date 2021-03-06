// @ts-check

const host = '';
const prefix = 'api/v1';

export const baseURL = [host, prefix].join('/');

export default {
  login: () => ['login'].join('/'),
  suppliers: () => ['suppliers'].join('/'),
  supplier: (id) => ['suppliers', id].join('/'),
  products: () => ['products'].join('/'),
  product: (id) => ['products', id].join('/'),
  purchases: () => ['purchases'].join('/'),
  purchaseParser: () => ['purchases', 'parse'].join('/'),
  categories: () => ['categories'].join('/'),
  category: (id) => ['categories', id].join('/'),
};
