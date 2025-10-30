import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  transformAndLogLoginData,
  type ILoginDetails,
  type ILoginResponse,
} from "./login";

export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
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
        transformAndLogLoginData(response);

        const loginResponse = data as ILoginResponse;
        if (loginResponse) {
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
  }),
});

export const { useLoginUserMutation } = loginApi;
