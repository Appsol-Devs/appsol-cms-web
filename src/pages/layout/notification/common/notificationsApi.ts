import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { INotification } from "@/pages/customer/common/customers";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["INotification"],
  endpoints: (builder) => ({
    markAsRead: builder.mutation<void, string>({
      query: (_id) => ({
        url: `notifications/${_id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["INotification"],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: `notifications/mark-all-read`,
        method: "PUT",
      }),
      invalidatesTags: ["INotification"],
    }),
    getANotification: builder.query<INotification, string>({
      query: (id) => ({
        url: "/notifications/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),

    getPaginatedNotifications: builder.query<
      PaginatedResponse<INotification[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/notifications?pageSize=${pageSize}`;
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
        const data: INotification[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as INotification[],
          providedTags: ["INotification"],
        };
      },
    }),
  }),
});

export const {
  useLazyGetANotificationQuery,
  useMarkAsReadMutation,
  useMarkAllReadMutation,
  useLazyGetPaginatedNotificationsQuery,
  useGetPaginatedNotificationsQuery,
} = notificationsApi;
