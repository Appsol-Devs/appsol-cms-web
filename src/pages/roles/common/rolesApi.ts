import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { IPermission, IRole } from "@/pages/auth/login/common/login";

export const rolesApi = createApi({
  reducerPath: "rolesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["IRole"],
  endpoints: (builder) => ({
    getRoles: builder.query<PaginatedResponse<IRole[]>, IBaseQueryParam>({
      query: ({ pageIndex, pageSize, search }) => {
        let url = `/roles?pageSize=${pageSize}`;
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
        const data: IRole[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as IRole[],
        };
      },
    }),
    addRole: builder.mutation<IRole, IRole>({
      query: (payload) => ({
        url: "roles",
        body: payload,
        method: "POST",
      }),
    }),
    updateRole: builder.mutation<IRole, IRole>({
      query: ({ id, ...payload }) => ({
        url: `roles/${id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    getARole: builder.query<IRole, string>({
      query: (id) => ({
        url: `roles/${id}`,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    deleteRole: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `roles/${id}`,
        method: "DELETE",
      }),
    }),
    getPermissions: builder.query<IPermission[], void>({
      query: () => ({
        url: "permissions",
      }),
      transformResponse: async (response: Response) => {
        const data = await response.json();
        return data as IPermission[];
      },
    }),
  }),
});

export const {
  useLazyGetPermissionsQuery,
  useLazyGetARoleQuery,
  useLazyGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
