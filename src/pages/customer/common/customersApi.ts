import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { prepareApiHeaders, type IBaseQueryParam } from "@/lib/api";
import {
  getPaginationMetaDataV2,
  getQueryRequestUrl,
  type IFilters,
  type IPagination,
  type PaginatedResponse,
} from "@/lib/pagination";
import type { ICustomer } from "./customers";
import type { ICustomerOutreach } from "@/pages/customer-outreaches/common/customer-outreach";
import type { ITicket } from "@/pages/ticket/common/tickets";
import type { IComplaint } from "@/pages/complaint/common/complaints";
import type { IPayment } from "@/pages/payments/common/payments";

async function readListFromBqResponse<T>(data: unknown): Promise<T[]> {
  if (data instanceof Response) {
    const raw = await data.json();
    return Array.isArray(raw)
      ? raw
      : ((raw as { contents?: T[] }).contents ?? []);
  }
  if (Array.isArray(data)) return data;
  return (data as { contents?: T[] })?.contents ?? [];
}

function buildListPagination(
  total: number,
  pageIndex: number,
  pageSize: number,
): IPagination {
  return {
    totalCounts: total,
    metaData: {
      total_count: total,
      total_pages: Math.max(1, Math.ceil(total / pageSize) || 1),
      page_number: pageIndex,
      page_size: pageSize,
    },
  };
}

function getPaymentCustomerId(payment: IPayment): string | undefined {
  if (payment.customerId) return String(payment.customerId);

  const customer = payment.customer;
  if (!customer) return undefined;
  if (typeof customer === "string") return customer;

  if (customer.id) return String(customer.id);
  const customerRecord = customer as { id?: string };
  if (customerRecord.id) return String(customerRecord.id);

  return undefined;
}

function paymentBelongsToCustomer(
  payment: IPayment,
  customerId: string,
): boolean {
  const paymentCustomerId = getPaymentCustomerId(payment);
  return paymentCustomerId === String(customerId);
}

function applyPaymentListFilters(
  payments: IPayment[],
  filters: IFilters | undefined,
  search: string | undefined,
): IPayment[] {
  let result = payments;

  if (filters?.status) {
    const status = filters.status.toLowerCase();
    result = result.filter(
      (payment) => payment.status?.toLowerCase() === status,
    );
  }

  if (filters?.startDate) {
    const start = new Date(filters.startDate).getTime();
    result = result.filter((payment) => {
      const paymentTime = new Date(
        payment.paymentDate ?? payment.createdAt ?? 0,
      ).getTime();
      return paymentTime >= start;
    });
  }

  if (filters?.endDate) {
    const end = new Date(filters.endDate).getTime();
    result = result.filter((payment) => {
      const paymentTime = new Date(
        payment.paymentDate ?? payment.createdAt ?? 0,
      ).getTime();
      return paymentTime <= end;
    });
  }

  const query = search?.trim().toLowerCase();
  if (query) {
    result = result.filter((payment) => {
      const customerName = payment.customer?.name?.toLowerCase() ?? "";
      const companyName = payment.customer?.companyName?.toLowerCase() ?? "";
      return (
        payment.paymentCode?.toLowerCase().includes(query) ||
        payment.paymentReference?.toLowerCase().includes(query) ||
        customerName.includes(query) ||
        companyName.includes(query)
      );
    });
  }

  return result;
}

function buildTicketPagination(
  total: number,
  pageIndex: number,
  pageSize: number,
): IPagination {
  return buildListPagination(total, pageIndex, pageSize);
}

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
      query: ({ id, ...payload }) => ({
        url: `customers/${id}`,
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
      async queryFn(
        { customerId, pageIndex = 1, pageSize = 10, search },
        _api,
        _extraOptions,
        fetchWithBQ,
      ) {
        const safePageSize = pageSize && pageSize > 0 ? pageSize : 10;
        const safePageIndex = pageIndex && pageIndex > 0 ? pageIndex : 1;

        if (!customerId) {
          return {
            data: {
              contents: [],
              pagination: buildTicketPagination(0, safePageIndex, safePageSize),
            },
          };
        }

        const complaintsResult = await fetchWithBQ(
          `/customer_complaints?customerId=${encodeURIComponent(customerId)}&pageSize=1000&pageIndex=1`,
        );
        if (complaintsResult.error) {
          return { error: complaintsResult.error as FetchBaseQueryError };
        }

        const complaints = await readListFromBqResponse<IComplaint>(
          complaintsResult.data,
        );

        const ticketMap = new Map<string, ITicket>();
        const complaintsMissingTicket: IComplaint[] = [];

        for (const complaint of complaints) {
          if (complaint.ticket?.id) {
            ticketMap.set(complaint.ticket.id, {
              ...complaint.ticket,
              complaint,
              complaintId: complaint.id ?? complaint.ticket.complaintId,
            });
            continue;
          }
          if (complaint.id) {
            complaintsMissingTicket.push(complaint);
          }
        }

        await Promise.all(
          complaintsMissingTicket.map(async (complaint) => {
            const ticketsResult = await fetchWithBQ(
              `/tickets?complaintId=${encodeURIComponent(complaint.id!)}&pageSize=100`,
            );
            if (ticketsResult.error) return;

            const tickets = await readListFromBqResponse<ITicket>(
              ticketsResult.data,
            );

            for (const ticket of tickets) {
              if (!ticket.id || ticketMap.has(ticket.id)) continue;
              ticketMap.set(ticket.id, {
                ...ticket,
                complaint: ticket.complaint ?? complaint,
                complaintId: ticket.complaintId ?? complaint.id,
              });
            }
          }),
        );

        let tickets = Array.from(ticketMap.values()).sort((a, b) => {
          const aTime = new Date(a.createdAt ?? a.requestedDate ?? 0).getTime();
          const bTime = new Date(b.createdAt ?? b.requestedDate ?? 0).getTime();
          return bTime - aTime;
        });

        const query = search?.trim().toLowerCase();
        if (query) {
          tickets = tickets.filter((ticket) => {
            const customerName =
              ticket.complaint?.customer?.name?.toLowerCase() ?? "";
            return (
              ticket.ticketCode?.toLowerCase().includes(query) ||
              ticket.title?.toLowerCase().includes(query) ||
              customerName.includes(query)
            );
          });
        }

        const total = tickets.length;
        const start = (safePageIndex - 1) * safePageSize;
        const contents = tickets.slice(start, start + safePageSize);

        return {
          data: {
            contents,
            pagination: buildTicketPagination(
              total,
              safePageIndex,
              safePageSize,
            ),
          },
        };
      },
    }),
    getCustomerComplaints: builder.query<
      PaginatedResponse<IComplaint[]>,
      IBaseQueryParam
    >({
      query: ({ pageIndex, search, pageSize, customerId }) => {
        let url = `/customer_complaints?pageSize=${pageSize}`;
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
      async queryFn(
        { customerId, pageIndex = 1, pageSize = 10, search, filters },
        _api,
        _extraOptions,
        fetchWithBQ,
      ) {
        const safePageSize = pageSize && pageSize > 0 ? pageSize : 10;
        const safePageIndex = pageIndex && pageIndex > 0 ? pageIndex : 1;

        if (!customerId) {
          return {
            data: {
              contents: [],
              pagination: buildListPagination(0, safePageIndex, safePageSize),
            },
          };
        }

        const serverFilters = { ...filters };
        delete serverFilters.customerId;

        const scopedParams = new URLSearchParams();
        scopedParams.set("pageSize", String(safePageSize));
        scopedParams.set("pageIndex", String(safePageIndex));
        if (search) scopedParams.set("search", search);
        scopedParams.set("customerId", customerId);

        const scopedResult = await fetchWithBQ(
          getQueryRequestUrl(
            `/payments?${scopedParams.toString()}`,
            serverFilters,
          ),
        );

        if (!scopedResult.error) {
          const scopedBatch = await readListFromBqResponse<IPayment>(
            scopedResult.data,
          );
          const scopedMatches = scopedBatch.filter((payment) =>
            paymentBelongsToCustomer(payment, customerId),
          );
          const apiScopesByCustomer =
            scopedBatch.length > 0 &&
            scopedMatches.length === scopedBatch.length;

          if (apiScopesByCustomer) {
            const scopedPagination =
              scopedResult.data instanceof Response
                ? getPaginationMetaDataV2(scopedResult.data)
                : null;

            return {
              data: {
                contents: scopedMatches,
                pagination: (scopedPagination ??
                  buildListPagination(
                    scopedMatches.length,
                    safePageIndex,
                    safePageSize,
                  )) as IPagination,
              },
            };
          }
        }

        try {
          const collected: IPayment[] = [];
          const seenIds = new Set<string>();
          let scanPageIndex = 1;
          const scanPageSize = 100;

          while (scanPageIndex <= 100) {
            const params = new URLSearchParams();
            params.set("pageSize", String(scanPageSize));
            params.set("pageIndex", String(scanPageIndex));

            const paymentsResult = await fetchWithBQ(
              `/payments?${params.toString()}`,
            );
            if (paymentsResult.error) {
              return {
                error: paymentsResult.error as FetchBaseQueryError,
              };
            }

            const batch = await readListFromBqResponse<IPayment>(
              paymentsResult.data,
            );
            if (!batch.length) break;

            for (const payment of batch) {
              if (!paymentBelongsToCustomer(payment, customerId)) {
                continue;
              }
              const paymentId = payment.id ?? payment.paymentCode;
              if (paymentId && seenIds.has(paymentId)) continue;
              if (paymentId) seenIds.add(paymentId);
              collected.push(payment);
            }

            if (batch.length < scanPageSize) break;
            scanPageIndex += 1;
          }

          const payments = collected.sort((a, b) => {
            const aTime = new Date(a.paymentDate ?? a.createdAt ?? 0).getTime();
            const bTime = new Date(b.paymentDate ?? b.createdAt ?? 0).getTime();
            return bTime - aTime;
          });

          const filtered = applyPaymentListFilters(payments, filters, search);

          const total = filtered.length;
          const start = (safePageIndex - 1) * safePageSize;
          const contents = filtered.slice(start, start + safePageSize);

          return {
            data: {
              contents,
              pagination: buildListPagination(
                total,
                safePageIndex,
                safePageSize,
              ),
            },
          };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
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
