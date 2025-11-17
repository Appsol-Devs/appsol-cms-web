import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type {
  ICallStatus,
  IComplaintCategory,
  IComplaintType,
  ILeadNextStep,
  ILeadStatus,
  ISetupStatus,
  ISoftware,
  ISubscriptionType,
} from "./settings";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  //   tagTypes: ["ISoftware"],
  endpoints: (builder) => ({
    // Softwares Api
    getSoftwares: builder.query<
      PaginatedResponse<ISoftware[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/softwares?limit=${limit}`;
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
        const data: ISoftware[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ISoftware[],
        };
      },
    }),
    addSoftware: builder.mutation<ISoftware, ISoftware>({
      query: (payload) => ({
        url: "softwares",
        body: payload,
        method: "POST",
      }),
    }),
    updateSoftware: builder.mutation<ISoftware, ISoftware>({
      query: ({ _id, ...payload }) => ({
        url: `softwares/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteSoftware: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `softwares/${id}`,
        method: "DELETE",
      }),
    }),
    getComplaintTypes: builder.query<
      PaginatedResponse<IComplaintType[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/complaintsTypes?limit=${limit}`;
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
        const data: IComplaintType[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as IComplaintType[],
        };
      },
    }),
    addComplaintType: builder.mutation<IComplaintType, IComplaintType>({
      query: (payload) => ({
        url: "complaintsTypes",
        body: payload,
        method: "POST",
      }),
    }),
    updateComplaintType: builder.mutation<IComplaintType, IComplaintType>({
      query: ({ _id, ...payload }) => ({
        url: `complaintsTypes/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteComplaintType: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `complaintsTypes/${id}`,
        method: "DELETE",
      }),
    }),
    getComplaintCategories: builder.query<
      PaginatedResponse<IComplaintCategory[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/complaintCategories?limit=${limit}`;
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
        const data: IComplaintCategory[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as IComplaintCategory[],
        };
      },
    }),
    addComplaintCategory: builder.mutation<
      IComplaintCategory,
      IComplaintCategory
    >({
      query: (payload) => ({
        url: "complaintCategories",
        body: payload,
        method: "POST",
      }),
    }),
    updateComplaintCategory: builder.mutation<
      IComplaintCategory,
      IComplaintCategory
    >({
      query: ({ _id, ...payload }) => ({
        url: `complaintCategories/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteComplaintCategory: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `complaintCategories/${id}`,
        method: "DELETE",
      }),
    }),
    getCallStatuses: builder.query<
      PaginatedResponse<ICallStatus[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/callStatuses?limit=${limit}`;
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
        const data: ICallStatus[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ICallStatus[],
        };
      },
    }),
    addCallStatus: builder.mutation<ICallStatus, ICallStatus>({
      query: (payload) => ({
        url: "callStatuses",
        body: payload,
        method: "POST",
      }),
    }),
    updateCallStatus: builder.mutation<ICallStatus, ICallStatus>({
      query: ({ _id, ...payload }) => ({
        url: `callStatuses/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteCallStatus: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `callStatuses/${id}`,
        method: "DELETE",
      }),
    }),
    getSetupStatuses: builder.query<
      PaginatedResponse<ISetupStatus[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/setupStatuses?limit=${limit}`;
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
        const data: ISetupStatus[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ISetupStatus[],
        };
      },
    }),
    addSetupStatus: builder.mutation<ISetupStatus, ISetupStatus>({
      query: (payload) => ({
        url: "setupStatuses",
        body: payload,
        method: "POST",
      }),
    }),
    updateSetupStatus: builder.mutation<ISetupStatus, ISetupStatus>({
      query: ({ _id, ...payload }) => ({
        url: `setupStatuses/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteSetupStatus: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `setupStatuses/${id}`,
        method: "DELETE",
      }),
    }),
    getSubscriptionTypes: builder.query<
      PaginatedResponse<ISubscriptionType[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/subscriptionTypes?limit=${limit}`;
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
        const data: ISubscriptionType[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ISubscriptionType[],
        };
      },
    }),
    addSubscriptionType: builder.mutation<ISubscriptionType, ISubscriptionType>(
      {
        query: (payload) => ({
          url: "subscriptionTypes",
          body: payload,
          method: "POST",
        }),
      }
    ),
    updateSubscriptionType: builder.mutation<
      ISubscriptionType,
      ISubscriptionType
    >({
      query: ({ _id, ...payload }) => ({
        url: `subscriptionTypes/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteSubscriptionType: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `subscriptionTypes/${id}`,
        method: "DELETE",
      }),
    }),
    getLeadStatuses: builder.query<
      PaginatedResponse<ILeadStatus[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/leadStatuses?limit=${limit}`;
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
        const data: ILeadStatus[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ILeadStatus[],
        };
      },
    }),
    addLeadStatus: builder.mutation<ILeadStatus, ILeadStatus>({
      query: (payload) => ({
        url: "leadStatuses",
        body: payload,
        method: "POST",
      }),
    }),
    updateLeadStatus: builder.mutation<ILeadStatus, ILeadStatus>({
      query: ({ _id, ...payload }) => ({
        url: `leadStatuses/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteLeadStatus: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `leadStatuses/${id}`,
        method: "DELETE",
      }),
    }),
    getLeadNextSteps: builder.query<
      PaginatedResponse<ILeadNextStep[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, limit, search }) => {
        let url = `/leadNextSteps?limit=${limit}`;
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
        const data: ILeadNextStep[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ILeadNextStep[],
        };
      },
    }),
    addLeadNextStep: builder.mutation<ILeadNextStep, ILeadNextStep>({
      query: (payload) => ({
        url: "leadNextSteps",
        body: payload,
        method: "POST",
      }),
    }),
    updateLeadNextStep: builder.mutation<ILeadNextStep, ILeadNextStep>({
      query: ({ _id, ...payload }) => ({
        url: `leadNextSteps/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteLeadNextStep: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `leadNextSteps/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetSoftwaresQuery,
  useAddSoftwareMutation,
  useUpdateSoftwareMutation,
  useDeleteSoftwareMutation,
  useLazyGetComplaintTypesQuery,
  useAddComplaintTypeMutation,
  useUpdateComplaintTypeMutation,
  useDeleteComplaintTypeMutation,
  useLazyGetComplaintCategoriesQuery,
  useAddComplaintCategoryMutation,
  useUpdateComplaintCategoryMutation,
  useDeleteComplaintCategoryMutation,
  useLazyGetCallStatusesQuery,
  useAddCallStatusMutation,
  useUpdateCallStatusMutation,
  useDeleteCallStatusMutation,
  useLazyGetSetupStatusesQuery,
  useAddSetupStatusMutation,
  useUpdateSetupStatusMutation,
  useDeleteSetupStatusMutation,
  useLazyGetSubscriptionTypesQuery,
  useAddSubscriptionTypeMutation,
  useUpdateSubscriptionTypeMutation,
  useDeleteSubscriptionTypeMutation,
  useLazyGetLeadStatusesQuery,
  useAddLeadStatusMutation,
  useUpdateLeadStatusMutation,
  useDeleteLeadStatusMutation,
  useLazyGetLeadNextStepsQuery,
  useAddLeadNextStepMutation,
  useUpdateLeadNextStepMutation,
  useDeleteLeadNextStepMutation,
} = settingsApi;
