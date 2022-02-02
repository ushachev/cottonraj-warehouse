import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react/index.js';

import routes, { baseURL as baseUrl } from '../routes.js';

const tags = {
  SUPPLIER: 'SUPPLIER',
};

const httpMethods = {
  POST: 'POST',
  PATCH: 'PATCH',
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
      transformResponse: (response) => response.suppliers,
      providesTags: [tags.SUPPLIER],
    }),
    addSupplier: builder.mutation({
      query: (data) => ({
        url: routes.suppliers(),
        method: httpMethods.POST,
        body: data,
      }),
      invalidatesTags: [tags.SUPPLIER],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useAddSupplierMutation,
} = api;
