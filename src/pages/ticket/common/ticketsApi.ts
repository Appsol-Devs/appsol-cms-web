import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ITicket, ICreateTicketPayload, IReassignTicketPayload } from "./tickets";

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ITicket"],
  endpoints: (builder) => ({
    getTickets: builder.query<
      PaginatedResponse<ITicket[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/tickets?pageSize=${pageSize}`;
        if (search) {
          url += `&search=${search}`;
        }
        if (pageIndex) {
          url += `&pageIndex=${pageIndex}`;
        }
        return { url };
      },
      transformResponse: async (response: Response) => {
        const raw = await response.json();
        const contents = Array.isArray(raw)
          ? raw
          : ((raw as { contents?: ITicket[] }).contents ?? []);
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: contents as ITicket[],
        };
      },
    }),
    getATicket: builder.query<ITicket, string>({
      query: (id) => ({
        url: "/tickets/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    getTicketsByComplaintId: builder.query<ITicket[], string>({
      query: (complaintId) => ({
        url: `/tickets?complaintId=${complaintId}&pageSize=100`,
      }),
      transformResponse: async (response: Response) => {
        const data = await response.json();
        if (Array.isArray(data)) return data as ITicket[];
        return (data as { contents?: ITicket[] }).contents ?? [];
      },
    }),
    addTicket: builder.mutation<ITicket, ICreateTicketPayload>({
      query: (payload) => ({
        url: "/tickets",
        body: payload,
        method: "POST",
      }),
    }),
    updateTicket: builder.mutation<
      ITicket,
      { _id: string } & ICreateTicketPayload
    >({
      query: ({ _id, ...payload }) => ({
        url: `/tickets/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteTicket: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/tickets/${id}`,
        method: "DELETE",
      }),
    }),
    reassignTicket: builder.mutation<
      ITicket,
      { id: string } & IReassignTicketPayload
    >({
      query: ({ id, ...payload }) => ({
        url: `/tickets/${id}`,
        body: payload,
        method: "PATCH",
      }),
      invalidatesTags: ["ITicket"],
    }),
    closeTicket: builder.mutation<ITicket, string>({
      query: (id) => ({
        url: `/tickets/${id}/close`,
        method: "PATCH",
      }),
      transformResponse: async (response: Response) => response.json(),
      invalidatesTags: ["ITicket"],
    }),
  }),
});

export const {
  useLazyGetTicketsQuery,
  useLazyGetATicketQuery,
  useLazyGetTicketsByComplaintIdQuery,
  useAddTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useReassignTicketMutation,
  useCloseTicketMutation,
} = ticketsApi;
