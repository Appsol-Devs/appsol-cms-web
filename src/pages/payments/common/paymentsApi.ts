import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { IPayment, IPaymentCreatePayload } from "./payments";

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["IPayment"],
  endpoints: (builder) => ({
    getPayment: builder.query<IPayment, string>({
      query: (id) => ({ url: `/payments/${id}` }),
      transformResponse: async (response: Response) => response.json(),
    }),
    getPayments: builder.query<
      PaginatedResponse<IPayment[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, filters }) => {
        const params = new URLSearchParams();

        if (search) params.set("search", search);
        if (pageSize !== undefined)
          params.set("pageSize", String(pageSize));
        if (pageIndex !== undefined)
          params.set("pageIndex", String(pageIndex));

        return {
          url: getQueryRequestUrl(
            `/payments?${params.toString()}`,
            filters
          ),
        };
      },
      transformResponse: async (response: Response) => {
        const data: IPayment[] = await response.json();
        const pagination = getPaginationMetaDataV2(response);
        return {
          pagination: (pagination ?? {
            totalCounts: Array.isArray(data) ? data.length : 0,
            metaData: {},
          }) as IPagination,
          contents: (Array.isArray(data) ? data : [data]) as IPayment[],
        };
      },
    }),
    createPayment: builder.mutation<IPayment, IPaymentCreatePayload>({
      query: (payload) => ({
        url: "/payments",
        body: payload,
        method: "POST",
      }),
      invalidatesTags: ["IPayment"],
    }),
    approveOrRejectPayment: builder.mutation<
      IPayment,
      { id: string; status: "approved" | "rejected" }
    >({
      query: ({ id, status }) => ({
        url: `/payments/${id}/approve-or-reject/${status}`,
        method: "PUT",
      }),
      invalidatesTags: ["IPayment"],
    }),
  }),
});

export const {
  useLazyGetPaymentsQuery,
  useLazyGetPaymentQuery,
  useCreatePaymentMutation,
  useApproveOrRejectPaymentMutation,
} = paymentsApi;
