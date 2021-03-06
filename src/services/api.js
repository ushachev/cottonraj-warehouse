import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react/index.js';

import routes, { baseURL as baseUrl } from '../routes.js';

const tags = {
  SUPPLIER: 'SUPPLIER',
  PRODUCT: 'PRODUCT',
  PURCHASE: 'PURCHASE',
  CATEGORY: 'CATEGORY',
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
    paramsSerializer: (params) => new URLSearchParams(Object.entries(params)
      .flatMap(([paramKey, paramValue]) => (Array.isArray(paramValue)
        ? paramValue.map((value) => [paramKey, value])
        : [paramKey, paramValue]))),
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
    updateSupplier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: routes.supplier(id),
        method: httpMethods.PATCH,
        body,
      }),
      invalidatesTags: [tags.SUPPLIER],
    }),
    getProducts: builder.query({
      query: routes.products,
      transformResponse: (response) => response.products,
      providesTags: [tags.PRODUCT],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: routes.product(id),
        method: httpMethods.PATCH,
        body,
      }),
      invalidatesTags: [tags.PRODUCT],
    }),
    updateProductBatch: builder.mutation({
      query: ({ ids, ...body }) => ({
        url: routes.products(),
        method: httpMethods.PATCH,
        params: { ids },
        body,
      }),
      invalidatesTags: [tags.PRODUCT],
    }),
    getPurchases: builder.query({
      query: routes.purchases,
      transformResponse: (response) => response.purchases,
      providesTags: [tags.PURCHASE],
    }),
    addPurchase: builder.mutation({
      query: (data) => ({
        url: routes.purchases(),
        method: httpMethods.POST,
        body: data,
      }),
      invalidatesTags: [tags.PRODUCT, tags.PURCHASE],
    }),
    parsePurchase: builder.mutation({
      query: (data) => ({
        url: routes.purchaseParser(),
        method: httpMethods.POST,
        headers: {
          'content-type': 'text/xml',
        },
        body: data,
      }),
    }),
    getCategories: builder.query({
      query: routes.categories,
      transformResponse: (response) => response.categories,
      providesTags: [tags.CATEGORY],
    }),
    addCategory: builder.mutation({
      query: (data) => ({
        url: routes.categories(),
        method: httpMethods.POST,
        body: data,
      }),
      invalidatesTags: [tags.CATEGORY],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: routes.category(id),
        method: httpMethods.PATCH,
        body,
      }),
      invalidatesTags: [tags.CATEGORY],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useUpdateProductBatchMutation,
  useGetPurchasesQuery,
  useAddPurchaseMutation,
  useParsePurchaseMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} = api;
