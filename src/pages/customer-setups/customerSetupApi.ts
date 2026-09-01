import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ICustomerSetup } from "./customerSetup";

export const customerSetupApi = createApi({
  reducerPath: "customerSetupApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ICustomerSetup"],
  endpoints: (builder) => ({
    getCustomerSetups: builder.query<
      PaginatedResponse<ICustomerSetup[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, filters }) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (pageSize !== undefined) params.set("pageSize", String(pageSize));
        if (pageIndex !== undefined) params.set("pageIndex", String(pageIndex));

        return {
          url: getQueryRequestUrl(
            `/customer_setups?${params.toString()}`,
            filters,
          ),
        };
      },
      transformResponse: async (response: Response) => {
        const data: ICustomerSetup[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ICustomerSetup[],
        };
      },
    }),
    getACustomerSetup: builder.query<ICustomerSetup, string>({
      query: (id) => ({
        url: "/customer_setups/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addCustomerSetup: builder.mutation<ICustomerSetup, ICustomerSetup>({
      query: (payload) => ({
        url: "customer_setups",
        body: payload,
        method: "POST",
      }),
    }),
    updateCustomerSetup: builder.mutation<ICustomerSetup, ICustomerSetup>({
      query: ({ id, ...payload }) => ({
        url: `customer_setups/${id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteCustomerSetup: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `customer_setups/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetCustomerSetupsQuery,
  useLazyGetACustomerSetupQuery,
  useAddCustomerSetupMutation,
  useUpdateCustomerSetupMutation,
  useDeleteCustomerSetupMutation,
} = customerSetupApi;
