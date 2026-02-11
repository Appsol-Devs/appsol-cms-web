import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type {
  IOutReachType,

} from "@/pages/customer/common/customers";

export const outReachApi = createApi({
  reducerPath: "outReachApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["IOutReachType"],
  endpoints: (builder) => ({
    getOutReachTypes: builder.query<
      PaginatedResponse<IOutReachType[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/outreach_types?pageSize=${pageSize}`;
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
        const data: IOutReachType[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as IOutReachType[],
        };
      },
    }),
    getOutReachType: builder.query<IOutReachType, string>({
      query: (id) => ({
        url: "/outreach_types/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),

    addOutReachType: builder.mutation<IOutReachType, IOutReachType>({
      query: (payload) => ({
        url: "outreach_types",
        body: payload,
        method: "POST",
      }),
    }),
    updateOutReachType: builder.mutation<IOutReachType, IOutReachType>({
      query: ({ _id, ...payload }) => ({
        url: `outreach_types/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteOutReachType: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `outreach_types/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetOutReachTypeQuery,
  useLazyGetOutReachTypesQuery,
  useAddOutReachTypeMutation,
  useUpdateOutReachTypeMutation,
  useDeleteOutReachTypeMutation,
} = outReachApi;
