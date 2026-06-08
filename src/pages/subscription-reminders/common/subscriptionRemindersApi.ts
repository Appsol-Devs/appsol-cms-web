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
  const pageSize =
    args.pageSize && args.pageSize > 0 ? args.pageSize : 10;
  params.set("pageSize", String(pageSize));
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
    triggerReminders: builder.mutation<void, void>({
      query: () => ({
        url: "/trigger-reminders",
        method: "POST",
        body: {},
        headers: {
          "x-api-key": import.meta.env.VITE_REMINDERS_TRIGGER_API_KEY ?? "",
        },
      }),
      invalidatesTags: ["ISubscriptionReminder"],
    }),
  }),
});

export const {
  useGetSubscriptionRemindersQuery,
  useLazyGetSubscriptionRemindersQuery,
  useTriggerRemindersMutation,
} = subscriptionRemindersApi;
