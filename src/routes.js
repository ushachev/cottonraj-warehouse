// @ts-check

const host = '';
const prefix = 'api/v1';

export const baseURL = [host, prefix].join('/');

export default {
  login: () => ['login'].join('/'),
  suppliers: () => ['suppliers'].join('/'),
  supplier: (id) => ['suppliers', id].join('/'),
  products: () => ['products'].join('/'),
  purchases: () => ['purchases'].join(''),
};
