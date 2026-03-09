import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ITicket, ICreateTicketPayload } from "./tickets";

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
        const data: ITicket[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ITicket[],
        };
      },
    }),
    getATicket: builder.query<ITicket, string>({
      query: (id) => ({
        url: "/tickets/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
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
  }),
});

export const {
  useLazyGetTicketsQuery,
  useLazyGetATicketQuery,
  useAddTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} = ticketsApi;
