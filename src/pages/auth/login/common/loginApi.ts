import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders } from "@/lib/api";
import {
  transformAndLogLoginData,
  type IChangePasswordPayload,
  type ILoginDetails,
  type ILoginResponse,
  type IResendPasswordResetOtpPayload,
  type IResetPasswordPayload,
  type IResetPasswordResponse,
  type IVerifyPasswordResetPayload,
  type IVerifyPasswordResetResponse,
} from "./login";
import type {
  IRequestOTPResponse,
} from "@/pages/customer/common/customers";

export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ILoginResponse"],
  endpoints: (builder) => ({
    loginUser: builder.mutation<ILoginResponse, ILoginDetails>({
      query: (payload) => ({
        url: "/auth/login",
        body: payload,
        method: "POST",
      }),
      transformResponse: async (response: Response) => {
        const data: ILoginResponse = await response.json();
        const loginResponse = data as ILoginResponse;

        if (loginResponse) {
          const token = loginResponse.token;
          transformAndLogLoginData(token);

          const newData = {
            signedIn: true,
            user_validation_info: loginResponse,
            access: loginResponse?.role,
          };

          localStorage.setItem("currentUser", JSON.stringify(newData));
        }
        return loginResponse;
      },
    }),
    resetPassword: builder.mutation<IResetPasswordResponse, IResetPasswordPayload>({
      query: (payload) => ({
        url: "/auth/reset_password",
        body: payload,
        method: "POST",
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    resendPasswordResetOtp: builder.mutation<
      IRequestOTPResponse,
      IResendPasswordResetOtpPayload
    >({
      query: (payload) => ({
        url: "/auth/send_otp",
        body: payload,
        method: "POST",
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    verifyPasswordReset: builder.mutation<
      IVerifyPasswordResetResponse,
      IVerifyPasswordResetPayload
    >({
      query: (payload) => ({
        url: "/auth/verify_password_reset",
        body: payload,
        method: "PUT",
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    changePassword: builder.mutation<void, IChangePasswordPayload>({
      query: (payload) => ({
        url: "/auth/change_password",
        body: payload,
        method: "PUT",
      }),
      transformResponse: async (response: Response) => {
        if (response.status === 204 || response.status === 205) return;
        const text = await response.text();
        return text ? JSON.parse(text) : undefined;
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useResetPasswordMutation,
  useResendPasswordResetOtpMutation,
  useVerifyPasswordResetMutation,
  useChangePasswordMutation,
} = loginApi;
