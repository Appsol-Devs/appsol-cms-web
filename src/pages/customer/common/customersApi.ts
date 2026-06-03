import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ICustomer } from "./customers";
import type { ICustomerOutreach } from "@/pages/customer-outreaches/common/customer-outreach";
import type { ITicket } from "@/pages/ticket/common/tickets";
import type { IComplaint } from "@/pages/complaint/common/complaints";
import type { IPayment } from "@/pages/payments/common/payments";

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => prepareApiHeaders(headers),
    responseHandler: async (response) => response,
  }),
  tagTypes: ["ICustomer"],
  endpoints: (builder) => ({
    getCustomers: builder.query<
      PaginatedResponse<ICustomer[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize }) => {
        let url = `/customers?pageSize=${pageSize}`;
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
        const data: ICustomer[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ICustomer[],
        };
      },
    }),
    getACustomer: builder.query<ICustomer, string>({
      query: (id) => ({
        url: "/customers/" + id,
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    addCustomer: builder.mutation<ICustomer, ICustomer>({
      query: (payload) => ({
        url: "customers",
        body: payload,
        method: "POST",
      }),
      transformResponse: async (response: Response) => response.json(),
    }),
    updateCustomer: builder.mutation<ICustomer, ICustomer>({
      query: ({ _id, ...payload }) => ({
        url: `customers/${_id}`,
        body: payload,
        method: "PUT",
      }),
    }),
    deleteCustomer: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `customers/${id}`,
        method: "DELETE",
      }),
    }),
    getCustomerOutreach: builder.query<
      PaginatedResponse<ICustomerOutreach[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, customerId }) => {
        let url = `/customer_outreachs?pageSize=${pageSize}`;
        if (search) {
          url += `&search=${search}`;
        }
        if (pageIndex) {
          url += `&pageIndex=${pageIndex}`;
        }
        if (customerId) {
          url += `&customerId=${customerId}`;
        }
        return {
          url: url,
        };
      },
      transformResponse: async (response: Response) => {
        const data: ICustomerOutreach[] = await response.json();
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: data as ICustomerOutreach[],
        };
      },
    }),
    getCustomerTickets: builder.query<
      PaginatedResponse<ITicket[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, customerId }) => {
        let url = `/tickets?pageSize=${pageSize}`;
        if (search) {
          url += `&search=${search}`;
        }
        if (pageIndex) {
          url += `&pageIndex=${pageIndex}`;
        }
        if (customerId) {
          url += `&customerId=${customerId}`;
        }
        return { url };
      },
      transformResponse: async (response: Response) => {
        const raw = await response.json();
        const contents = Array.isArray(raw)
          ? raw
          : ((raw as { contents?: ITicket[] }).contents ?? []);
        return {
          pagination: getPaginationMetaDataV2(response) as IPagination,
          contents: contents as ITicket[],
        };
      },
    }),
     getCustomerComplaints: builder.query<
          PaginatedResponse<IComplaint[]>,
          IBaseQueryParam
        >({
          query: ({ pageIndex, search, pageSize,customerId }) => {
            let url = `/customer_complaints?pageSize=${pageSize}`;
            if (search) {
              url += `&search=${search}`;
            }
            if (pageIndex) {
              url += `&pageIndex=${pageIndex}`;
            }
            if(customerId){
              url += `&customerId=${customerId}`;
            }
            return {
              url: url,
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
          getCustomerPayments: builder.query<
              PaginatedResponse<IPayment[]>,
              IBaseQueryParam
            >({
              query: ({ pageIndex, search, pageSize, filters }) => {
                const params = new URLSearchParams();
        
                if (search) params.set("search", search);
                if (pageSize !== undefined)
                  params.set("pageSize", String(pageSize));
                if (pageIndex !== undefined)
                  params.set("pageIndex", String(pageIndex));
        
                return {
                  url: getQueryRequestUrl(
                    `/payments?${params.toString()}`,
                    filters
                  ),
                };
              },
              transformResponse: async (response: Response) => {
                const data: IPayment[] = await response.json();
                const pagination = getPaginationMetaDataV2(response);
                return {
                  pagination: (pagination ?? {
                    totalCounts: Array.isArray(data) ? data.length : 0,
                    metaData: {},
                  }) as IPagination,
                  contents: (Array.isArray(data) ? data : [data]) as IPayment[],
                };
              },
            }),
  }),
});

export const {
  useLazyGetCustomerPaymentsQuery,
  useLazyGetCustomerComplaintsQuery,
  useLazyGetCustomerTicketsQuery,
  useLazyGetCustomerOutreachQuery,
  useLazyGetCustomersQuery,
  useAddCustomerMutation,
  useLazyGetACustomerQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
