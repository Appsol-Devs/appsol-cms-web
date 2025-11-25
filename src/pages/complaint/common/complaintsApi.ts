import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { IComplaint } from "./complaints";

export const complaintsApi = createApi({
  reducerPath: "complaintsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["IComplaint"],
  endpoints: (builder) => ({
    getComplaints: builder.query<
      PaginatedResponse<IComplaint[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/customer_complaints?pageSize=${pageSize}`;
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
        const data: IComplaint[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as IComplaint[],
        };
      },
    }),
    getAComplaint: builder.query<IComplaint, string>({
      query: (id) => ({
        url: "/customer_complaints/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addComplaint: builder.mutation<IComplaint, IComplaint>({
      query: (payload) => ({
        url: "customer_complaints",
        body: payload,
        method: "POST",
      }),
    }),
    updateComplaint: builder.mutation<IComplaint, IComplaint>({
      query: ({ _id, ...payload }) => ({
        url: `customer_complaints/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteComplaint: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `customer_complaints/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetComplaintsQuery,
  useAddComplaintMutation,
  useUpdateComplaintMutation,
  useDeleteComplaintMutation,
  useLazyGetAComplaintQuery,
} = complaintsApi;
