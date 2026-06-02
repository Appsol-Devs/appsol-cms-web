import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ICustomer } from "./customers";

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ICustomer"],
  endpoints: (builder) => ({
    getCustomers: builder.query<
      PaginatedResponse<ICustomer[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/customers?pageSize=${pageSize}`;
        if (search) {
          url += `&search=${search}`;
        }
        if (pageIndex) {
          url += `&pageIndex=${pageIndex}`;
        }
        return {
          url: url,
        };
      },
      transformResponse: async (response: Response) => {
        const data: ICustomer[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ICustomer[],
        };
      },
    }),
    getACustomer: builder.query<ICustomer, string>({
      query: (id) => ({
        url: "/customers/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addCustomer: builder.mutation<ICustomer, ICustomer>({
      query: (payload) => ({
        url: "customers",
        body: payload,
        method: "POST",
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    updateCustomer: builder.mutation<ICustomer, ICustomer>({
      query: ({ _id, ...payload }) => ({
        url: `customers/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteCustomer: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `customers/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetCustomersQuery,
  useAddCustomerMutation,
  useLazyGetACustomerQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
