import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
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
      query: ({ pageIndex, search, pageSize, filters }) => {
        const params = new URLSearchParams();
        if (pageSize !== undefined) params.set("pageSize", String(pageSize));
        if (search) params.set("search", search);
        if (pageIndex !== undefined) params.set("pageIndex", String(pageIndex));

        return {
          url: getQueryRequestUrl(
            `/customer_complaints?${params.toString()}`,
            filters,
          ),
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
