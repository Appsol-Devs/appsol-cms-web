import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ISubscription } from "./subscriptions";

export const subscriptionsApi = createApi({
  reducerPath: "subscriptionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ISubscription"],
  endpoints: (builder) => ({
    getSubscriptions: builder.query<
      PaginatedResponse<ISubscription[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, filters }) => {
        const params = new URLSearchParams();
        params.set("pageSize", String(pageSize ?? 10));
        if (search) params.set("search", search);
        if (pageIndex !== undefined) params.set("pageIndex", String(pageIndex));

        return {
          url: getQueryRequestUrl(
            `/subscriptions?${params.toString()}`,
            filters,
          ),
        };
      },
      transformResponse: async (response: Response) => {
        const data: ISubscription[] = await response.json();
        const pagination = getPaginationMetaDataV2(response);
        return {
          pagination: (pagination ?? {
            totalCounts: Array.isArray(data) ? data.length : 0,
            metaData: {},
          }) as IPagination,
          contents: (Array.isArray(data) ? data : [data]) as ISubscription[],
        };
      },
    }),
    getASubscription: builder.query<ISubscription, string>({
      query: (id) => ({
        url: "/subscriptions/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addSubscription: builder.mutation<ISubscription, Partial<ISubscription>>({
      query: (payload) => ({
        url: "/subscriptions",
        body: payload,
        method: "POST",
      }),
    }),
    updateSubscription: builder.mutation<
      ISubscription,
      Partial<ISubscription> & { _id: string }
    >({
      query: ({ _id, ...payload }) => ({
        url: `/subscriptions/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteSubscription: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/subscriptions/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetSubscriptionsQuery,
  useAddSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useLazyGetASubscriptionQuery,
} = subscriptionsApi;
