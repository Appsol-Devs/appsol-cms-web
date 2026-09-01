import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { IFeatureRequest } from "./feature-request";

export const featureRequestApi = createApi({
  reducerPath: "featureRequestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["IFeatureRequest"],
  endpoints: (builder) => ({
    getFeatureRequests: builder.query<
      PaginatedResponse<IFeatureRequest[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, filters }) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (pageSize !== undefined) params.set("pageSize", String(pageSize));
        if (pageIndex !== undefined) params.set("pageIndex", String(pageIndex));

        return {
          url: getQueryRequestUrl(
            `/feature_requests?${params.toString()}`,
            filters,
          ),
        };
      },
      transformResponse: async (response: Response) => {
        const data: IFeatureRequest[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as IFeatureRequest[],
        };
      },
    }),
    getAFeatureRequest: builder.query<IFeatureRequest, string>({
      query: (id) => ({
        url: "/feature_requests/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addFeatureRequest: builder.mutation<IFeatureRequest, IFeatureRequest>({
      query: (payload) => ({
        url: "feature_requests",
        body: payload,
        method: "POST",
      }),
    }),
    updateFeatureRequest: builder.mutation<IFeatureRequest, IFeatureRequest>({
      query: ({ id, ...payload }) => ({
        url: `feature_requests/${id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteFeatureRequest: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `feature_requests/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetFeatureRequestsQuery,
  useAddFeatureRequestMutation,
  useLazyGetAFeatureRequestQuery,
  useUpdateFeatureRequestMutation,
  useDeleteFeatureRequestMutation,
} = featureRequestApi;
