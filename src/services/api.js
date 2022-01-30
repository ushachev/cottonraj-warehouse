import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react/index.js';

import routes, { baseURL as baseUrl } from '../routes.js';

const tags = {
  SUPPLIER: 'SUPPLIER',
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const { token } = JSON.parse(localStorage.getItem('user'));

      headers.set('Authorization', `Bearer ${token}`);

      return headers;
    },
  }),
  tagTypes: Object.values(tags),
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: routes.suppliers,
      providesTags: [tags.SUPPLIER],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
} = api;
