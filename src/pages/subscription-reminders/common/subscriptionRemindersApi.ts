import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IFilters,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";

import type {
  ISubscriptionReminder,
  TSubscriptionReminderType,
} from "./subscription-reminder";

export interface ISubscriptionRemindersQueryParam extends IBaseQueryParam {
  filter?: TSubscriptionReminderType;
}

function buildListQueryParams(args: ISubscriptionRemindersQueryParam): string {
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
  const filter = args.filter ?? args.filters?.reminderType;
  if (filter) {
    params.set("filter", filter);
  }
  return params.toString();
}

function filtersWithoutReminderType(filters?: IFilters): IFilters | undefined {
  if (!filters?.reminderType) return filters;
  const { reminderType: _reminderType, ...rest } = filters;
  return Object.keys(rest).length > 0 ? rest : undefined;
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
      ISubscriptionRemindersQueryParam
    >({
      serializeQueryArgs: ({ queryArgs }) =>
        JSON.stringify({
          pageSize: queryArgs.pageSize,
          pageIndex: queryArgs.pageIndex,
          search: queryArgs.search,
          filter: queryArgs.filter ?? null,
          filters: queryArgs.filters ?? null,
        }),
      query: (args) => {
        const qs = buildListQueryParams(args);
        const base = `/subscription_reminders${qs ? `?${qs}` : ""}`;
        return {
          url: getQueryRequestUrl(
            base,
            filtersWithoutReminderType(args.filters),
          ),
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
