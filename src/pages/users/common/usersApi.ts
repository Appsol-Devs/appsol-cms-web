import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type {
  IRequestOTPPayload,
  IRequestOTPResponse,
  IUser,
  IVerifiyOTPPayload,
  IVerifyOTPResponse,
} from "@/pages/customer/common/customers";

export interface IUpdateUserProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  imageUrl?: string;
}

export type IUpdateUserProfileArg = {
  id: string;
} & IUpdateUserProfilePayload;

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["IUser"],
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<IUser[]>, IBaseQueryParam>({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/users?pageSize=${pageSize}`;
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
        const data: IUser[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as IUser[],
        };
      },
    }),
    getAUser: builder.query<IUser, string>({
      query: (id) => ({
        url: "/users/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    requestVerificationOTP: builder.mutation<
      IRequestOTPResponse,
      IRequestOTPPayload
    >({
      query: (payload) => ({
        url: "/auth/send_otp",
        body: payload,
        method: "POST",
      }),
    }),
    verifyOTP: builder.mutation<IVerifyOTPResponse, IVerifiyOTPPayload>({
      query: (payload) => ({
        url: "/auth/verify_otp",
        body: payload,
        method: "POST",
      }),
    }),
    addUser: builder.mutation<IUser, IUser>({
      query: (payload) => ({
        url: "users",
        body: payload,
        method: "POST",
      }),
    }),
    updateUser: builder.mutation<IUser, IUser>({
      query: ({ _id, ...payload }) => ({
        url: `users/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    updateUserProfile: builder.mutation<IUser, IUpdateUserProfileArg>({
      query: ({ id, ...payload }) => ({
        url: `users/${id}`,
        body: payload,
        method: "PUT",
      }),
      transformResponse: async (response: Response) => response.json(),
      invalidatesTags: ["IUser"],
    }),
    deleteUser: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useUpdateUserProfileMutation,
  useRequestVerificationOTPMutation,
  useVerifyOTPMutation,
  useDeleteUserMutation,
  useLazyGetAUserQuery,
} = usersApi;
