import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type {
  ICreateReschedulePayload,
  IReschedule,
  TargetEntityType,
} from "./reschedules";

export const reschedulesApi = createApi({
  reducerPath: "reschedulesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["IReschedule"],
  endpoints: (builder) => ({
    getReschedules: builder.query<
      PaginatedResponse<IReschedule[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, filters }) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (pageSize !== undefined) params.set("pageSize", String(pageSize));
        if (pageIndex !== undefined) params.set("pageIndex", String(pageIndex));
        return {
          url: getQueryRequestUrl(
            `/reschedules?${params.toString()}`,
            filters,
          ),
        };
      },
      transformResponse: async (response: Response) => {
        const raw = await response.json();
        const contents = Array.isArray(raw)
          ? raw
          : ((raw as { contents?: IReschedule[] }).contents ?? []);
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: contents as IReschedule[],
        };
      },
      providesTags: ["IReschedule"],
    }),
    getReschedulesByEntity: builder.query<
      IReschedule[],
      { type: TargetEntityType; id: string }
    >({
      query: ({ type, id }) => ({
        url: `/reschedules/by-entity/${type}/${id}`,
      }),
      transformResponse: async (response: Response) => {
        const data = await response.json();
        if (Array.isArray(data)) return data as IReschedule[];
        return (data as { contents?: IReschedule[] }).contents ?? [];
      },
      providesTags: ["IReschedule"],
    }),
    getAReschedule: builder.query<IReschedule, string>({
      query: (id) => ({ url: `/reschedules/${id}` }),
      transformResponse: async (response: Response) => response.json(),
      providesTags: ["IReschedule"],
    }),
    addReschedule: builder.mutation<IReschedule, ICreateReschedulePayload>({
      query: (payload) => ({
        url: "/reschedules",
        body: payload,
        method: "POST",
      }),
      transformResponse: async (response: Response) => response.json(),
      invalidatesTags: ["IReschedule"],
    }),
    updateReschedule: builder.mutation<
      IReschedule,
      { _id: string } & Partial<ICreateReschedulePayload>
    >({
      query: ({ _id, ...payload }) => ({
        url: `/reschedules/${_id}`,
        body: payload,
        method: "PUT",
      }),
      invalidatesTags: ["IReschedule"],
    }),
    deleteReschedule: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/reschedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IReschedule"],
    }),
  }),
});

export const {
  useLazyGetReschedulesQuery,
  useLazyGetReschedulesByEntityQuery,
  useLazyGetARescheduleQuery,
  useAddRescheduleMutation,
  useUpdateRescheduleMutation,
  useDeleteRescheduleMutation,
} = reschedulesApi;

