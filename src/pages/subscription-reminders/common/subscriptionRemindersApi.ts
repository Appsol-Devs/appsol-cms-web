import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ISubscriptionReminder } from "./subscription-reminder";

function buildListQueryParams(args: IBaseQueryParam): string {
  const params = new URLSearchParams();
  if (args.pageSize !== undefined) {
    params.set("pageSize", String(args.pageSize));
  }
  if (args.search) {
    params.set("search", args.search);
  }
  if (args.pageIndex !== undefined) {
    params.set("pageIndex", String(args.pageIndex));
  }
  return params.toString();
}

export const subscriptionRemindersApi = createApi({
  reducerPath: "subscriptionRemindersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ISubscriptionReminder"],
  endpoints: (builder) => ({
    getSubscriptionReminders: builder.query<
      PaginatedResponse<ISubscriptionReminder[]>,
      IBaseQueryParam
    >({
      query: (args) => {
        const qs = buildListQueryParams(args);
        const base = `/subscription_reminders${qs ? `?${qs}` : ""}`;
        return {
          url: getQueryRequestUrl(base, args.filters),
        };
      },
      transformResponse: async (response: Response) => {
        const data: ISubscriptionReminder[] = await response.json();
        const pagination = getPaginationMetaDataV2(response);
        return {
          pagination: (pagination ?? {
            totalCounts: Array.isArray(data) ? data.length : 0,
            metaData: {},
          }) as IPagination,
          contents: (Array.isArray(data) ? data : [data]) as ISubscriptionReminder[],
        };
      },
    }),
  }),
});

export const { useLazyGetSubscriptionRemindersQuery } = subscriptionRemindersApi;
