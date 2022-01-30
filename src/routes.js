// @ts-check

const host = '';
const prefix = 'api/v1';

export const baseURL = [host, prefix].join('/');

export default {
  login: () => ['login'].join('/'),
  suppliers: () => ['suppliers'].join(''),
};
