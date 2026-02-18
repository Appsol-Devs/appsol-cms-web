import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ICustomerOutreach } from "./customer-outreach";

export const customerOutreachApi = createApi({
  reducerPath: "CustomerOutreachApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ICustomerOutreach"],
  endpoints: (builder) => ({
    getCustomerOutReaches: builder.query<
      PaginatedResponse<ICustomerOutreach[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/customer_outreachs?pageSize=${pageSize}`;
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
        const data: ICustomerOutreach[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ICustomerOutreach[],
        };
      },
    }),
    getCustomerOutReach: builder.query<ICustomerOutreach, string>({
      query: (id) => ({
        url: "/customer_outreachs/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),

    addCustomerOutReach: builder.mutation<ICustomerOutreach, ICustomerOutreach>(
      {
        query: (payload) => ({
          url: "customer_outreachs",
          body: payload,
          method: "POST",
        }),
      },
    ),
    updateCustomerOutReach: builder.mutation<
      ICustomerOutreach,
      ICustomerOutreach
    >({
      query: ({ _id, ...payload }) => ({
        url: `customer_outreachs/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteCustomerOutReach: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `customer_outreachs/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetCustomerOutReachesQuery,
  useLazyGetCustomerOutReachQuery,
  useAddCustomerOutReachMutation,
  useUpdateCustomerOutReachMutation,
  useDeleteCustomerOutReachMutation,
} = customerOutreachApi;
