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
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/softwares?pageSize=${pageSize}`;
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
    getASoftware: builder.query<ISoftware, string>({
      query: (id) => ({
        url: "/softwares/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
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
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/complaint_types?pageSize=${pageSize}`;
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
    getAComplaintType: builder.query<IComplaintType, string>({
      query: (id) => ({
        url: "/complaint_types/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addComplaintType: builder.mutation<IComplaintType, IComplaintType>({
      query: (payload) => ({
        url: "complaint_types",
        body: payload,
        method: "POST",
      }),
    }),
    updateComplaintType: builder.mutation<IComplaintType, IComplaintType>({
      query: ({ _id, ...payload }) => ({
        url: `complaint_types/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteComplaintType: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `complaint_types/${id}`,
        method: "DELETE",
      }),
    }),
    getComplaintCategories: builder.query<
      PaginatedResponse<IComplaintCategory[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/complaint_categories?pageSize=${pageSize}`;
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
    getAComplaintCategory: builder.query<IComplaintCategory, string>({
      query: (id) => ({
        url: "/complaint_categories/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addComplaintCategory: builder.mutation<
      IComplaintCategory,
      IComplaintCategory
    >({
      query: (payload) => ({
        url: "complaint_categories",
        body: payload,
        method: "POST",
      }),
    }),
    updateComplaintCategory: builder.mutation<
      IComplaintCategory,
      IComplaintCategory
    >({
      query: ({ _id, ...payload }) => ({
        url: `complaint_categories/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteComplaintCategory: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `complaint_categories/${id}`,
        method: "DELETE",
      }),
    }),
    getCallStatuses: builder.query<
      PaginatedResponse<ICallStatus[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/call_statuses?pageSize=${pageSize}`;
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
    getACallStatus: builder.query<ICallStatus, string>({
      query: (id) => ({
        url: "/call_statuses/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addCallStatus: builder.mutation<ICallStatus, ICallStatus>({
      query: (payload) => ({
        url: "call_statuses",
        body: payload,
        method: "POST",
      }),
    }),
    updateCallStatus: builder.mutation<ICallStatus, ICallStatus>({
      query: ({ _id, ...payload }) => ({
        url: `call_statuses/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteCallStatus: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `call_statuses/${id}`,
        method: "DELETE",
      }),
    }),
    getSetupStatuses: builder.query<
      PaginatedResponse<ISetupStatus[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/setup_statuses?pageSize=${pageSize}`;
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
    getASetupStatus: builder.query<ISetupStatus, string>({
      query: (id) => ({
        url: "/setup_statuses/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addSetupStatus: builder.mutation<ISetupStatus, ISetupStatus>({
      query: (payload) => ({
        url: "setup_statuses",
        body: payload,
        method: "POST",
      }),
    }),
    updateSetupStatus: builder.mutation<ISetupStatus, ISetupStatus>({
      query: ({ _id, ...payload }) => ({
        url: `setup_statuses/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteSetupStatus: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `setup_statuses/${id}`,
        method: "DELETE",
      }),
    }),
    getSubscriptionTypes: builder.query<
      PaginatedResponse<ISubscriptionType[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/subscription_types?pageSize=${pageSize}`;
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
    getASubscriptionType: builder.query<ISubscriptionType, string>({
      query: (id) => ({
        url: "/subscription_types/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addSubscriptionType: builder.mutation<ISubscriptionType, ISubscriptionType>(
      {
        query: (payload) => ({
          url: "subscription_types",
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
        url: `subscription_types/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteSubscriptionType: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `subscription_types/${id}`,
        method: "DELETE",
      }),
    }),
    getLeadStatuses: builder.query<
      PaginatedResponse<ILeadStatus[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/lead_statuses?pageSize=${pageSize}`;
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
    getALeadStatus: builder.query<ILeadStatus, string>({
      query: (id) => ({
        url: "/lead_statuses/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addLeadStatus: builder.mutation<ILeadStatus, ILeadStatus>({
      query: (payload) => ({
        url: "lead_statuses",
        body: payload,
        method: "POST",
      }),
    }),
    updateLeadStatus: builder.mutation<ILeadStatus, ILeadStatus>({
      query: ({ _id, ...payload }) => ({
        url: `lead_statuses/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteLeadStatus: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `lead_statuses/${id}`,
        method: "DELETE",
      }),
    }),
    getLeadNextSteps: builder.query<
      PaginatedResponse<ILeadNextStep[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/lead_next_steps?pageSize=${pageSize}`;
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
        console.log("response 11", response.headers);
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ILeadNextStep[],
        };
      },
    }),
    getALeadNextStep: builder.query<ILeadNextStep, string>({
      query: (id) => ({
        url: "/lead_next_steps/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addLeadNextStep: builder.mutation<ILeadNextStep, ILeadNextStep>({
      query: (payload) => ({
        url: "lead_next_steps",
        body: payload,
        method: "POST",
      }),
    }),
    updateLeadNextStep: builder.mutation<ILeadNextStep, ILeadNextStep>({
      query: ({ _id, ...payload }) => ({
        url: `lead_next_steps/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteLeadNextStep: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `lead_next_steps/${id}`,
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
  useLazyGetACallStatusQuery,
  useLazyGetASetupStatusQuery,
  useLazyGetASubscriptionTypeQuery,
  useLazyGetALeadStatusQuery,
  useLazyGetALeadNextStepQuery,
  useLazyGetASoftwareQuery,
  useLazyGetAComplaintTypeQuery,
  useLazyGetAComplaintCategoryQuery,
} = settingsApi;
