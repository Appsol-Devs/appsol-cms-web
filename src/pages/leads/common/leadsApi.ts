import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ILead } from "./leads";

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ILead"],
  endpoints: (builder) => ({
    getLeads: builder.query<PaginatedResponse<ILead[]>, IBaseQueryParam>({
      query: ({ pageIndex, search, pageSize, filters }) => {
        const params = new URLSearchParams();

        if (search) params.set("search", search);
        if (pageSize !== undefined) params.set("pageSize", String(pageSize));
        if (pageIndex !== undefined) params.set("pageIndex", String(pageIndex));

        return {
          url: getQueryRequestUrl(`/leads?${params.toString()}`, filters),
        };
      },
      transformResponse: async (response: Response) => {
        const data: ILead[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ILead[],
        };
      },
    }),
    getALead: builder.query<ILead, string>({
      query: (id) => ({
        url: "/leads/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addLead: builder.mutation<ILead, ILead>({
      query: (payload) => ({
        url: "leads",
        body: payload,
        method: "POST",
      }),
    }),
    updateLead: builder.mutation<ILead, ILead>({
      query: ({ _id, ...payload }) => ({
        url: `leads/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteLead: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `leads/${id}`,
        method: "DELETE",
      }),
    }),
    convertLead: builder.mutation<ILead, string>({
      query: (id) => ({
        url: `leads/${id}/convert`,
        method: "PATCH",
      }),
      transformResponse: async (response: Response) => response.json(),
      invalidatesTags: ["ILead"],
    }),
  }),
});

export const {
  useLazyGetLeadsQuery,
  useAddLeadMutation,
  useLazyGetALeadQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useConvertLeadMutation,
} = leadsApi;
