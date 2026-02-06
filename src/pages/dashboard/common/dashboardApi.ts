import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders } from "@/lib/api";
import type {
  IDashboardDateRange,
  IDashboardSummary,
  IOperationalInsights,
  IWeeklyRevenueTrends,
} from "./dashboard";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["DashboardSummary", "WeeklyRevenueTrends", "OperationalInsights"],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<IDashboardSummary, IDashboardDateRange>({
      query: ({ startDate, endDate }) => ({
        url: "/dashboard/summary",
        params: { startDate, endDate },
      }),
      transformResponse: async (response: Response) =>
        response.json() as Promise<IDashboardSummary>,
    }),

    getWeeklyRevenueTrends: builder.query<
      IWeeklyRevenueTrends,
      IDashboardDateRange
    >({
      query: ({ endDate }) => {
        const dateOnly = (s: string) => s.split("T")[0] ?? s;
        const anchor = dateOnly(endDate);
        return {
          url: "/dashboard/weekly-revenue-trends",
          params: { startDate: anchor, endDate: anchor },
        };
      },
      transformResponse: async (response: Response) =>
        response.json() as Promise<IWeeklyRevenueTrends>,
    }),
    getOperationalInsights: builder.query<IOperationalInsights, void>({
      query: () => ({
        url: "/dashboard/operational-insights",
      }),
      transformResponse: async (response: Response) =>
        response.json() as Promise<IOperationalInsights>,
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useLazyGetDashboardSummaryQuery,
  useGetWeeklyRevenueTrendsQuery,
  useLazyGetWeeklyRevenueTrendsQuery,
  useGetOperationalInsightsQuery,
  useLazyGetOperationalInsightsQuery,
} = dashboardApi;
