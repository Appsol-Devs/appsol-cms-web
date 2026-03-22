import type { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { useState } from "react";

/**
 *
 * @param initialSize -> number
 * @param pageCount -> number
 *   const { limit, onPaginationChange, skip, pagination } = usePagination();
 */
export const usePagination = (
  initialSize: number = 10,
  page_count?: number,
) => {
  const [pagination, setPagination] = useState<IMetaData>({
    page_size: initialSize,
    page_number: 1,
    total_pages: page_count,
    total_count: 0,
  });
  const { page_size, page_number } = pagination;

  return {
    page_size: page_size,
    onPaginationChange: setPagination,
    pagination,
    page_number: page_number,
  };
};

// export type IPaginationState = {
//   pageIndex: number;
//   pageSize: number;
//   pageCount?: number;
//   totalPages?: number;
//   totalCount?: number;
// };

export const getPaginationMetaData = (meta: FetchBaseQueryMeta | undefined) => {
  let paginationState: IPagination | null = null;
  if (meta && meta.response) {
    const headers = meta?.response?.headers ?? {};
    paginationState = {
      totalCounts: Number(headers.get("_meta_total_count") ?? "0"),
      metaData:
        headers &&
        (Object.fromEntries(
          [...(meta?.response?.headers.entries() ?? {})]
            .filter(
              ([key]) => key.startsWith("_meta_") || key.startsWith("_metal_"),
            ) // Filter headers that start with "_meta_  /#|_/g"
            .map(([key, value]) => [
              key.replace(/_meta_|_metal_/g, ""),
              Number(value),
            ]), // Remove prefix and convert to number
        ) as unknown as IMetaData),
    };
  }

  return paginationState;
};

export const getPaginationMetaDataV2 = (
  response: Response | undefined,
): IPagination | null => {
  if (!response) return null;

  const paginationHeader = response.headers.get("x-pagination");
  if (!paginationHeader) return null;

  let parsed: any;
  try {
    parsed = JSON.parse(paginationHeader);
  } catch (err) {
    console.error("Invalid x-pagination JSON:", paginationHeader);
    return null;
  }

  const totalPages = Number(parsed.totalPages ?? 0);
  const currentPage = Number(parsed.pageCount ?? 1);
  const totalCount = Number(parsed.totalCount ?? 0);
  const pageSize = Number(parsed.size ?? 0);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const metaData: IMetaData = {
    total_count: totalCount,
    total_pages: totalPages,
    page_number: currentPage,
    page_size: pageSize,
    has_next_page: hasNextPage,
    has_prev_page: hasPrevPage,
    next_page: hasNextPage ? currentPage + 1 : null,
    prev_page: hasPrevPage ? currentPage - 1 : null,
  };

  const pagination: IPagination = {
    totalCounts: totalCount,
    metaData,
  };

  return pagination;
};

export interface PaginatedResponse<T> {
  contents: T;
  pagination: IPagination;
}

export interface IPagination {
  totalCounts: number;
  metaData: IMetaData;
}

export interface ISort {
  name: string;
  value: string;
}

export interface IMetaData {
  total_count?: number;
  total_pages?: number;
  page_number?: number;
  page_size?: number;
  has_next_page?: boolean;
  has_prev_page?: boolean;
  next_page?: number | null;
  prev_page?: number | null;
}

export interface IFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  customerId?: string;
  leadStatusId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  loggedBy?: string;
  originalDateTime?: string;
  newDateTime?: string;
  [key: string]: string | undefined;
  priority?: string;
  featureStatus?: string;
  softwareId?: string;
  assignedTo?: string;
  reminderType?: string;
  isSent?: string;
}

const ALL_FILTERS = [
  "customerId",
  "date",
  "date_range",
  "status",
  "leadStatusId",
  "targetEntityType",
  "targetEntityId",
  "loggedBy",
  "priority",
  "featureStatus",
  "softwareId",
  "assignedTo",
  "featurePriority",
  "reminderType",
  "isSent",
] as const;

export type IFilterArray = (typeof ALL_FILTERS)[number];

export const getQueryRequestUrl = (url: string = "", filters?: IFilters) => {
  if (!filters) return url;

  const activeFilters = Object.entries(filters)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");

  if (!activeFilters) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${activeFilters}`;
};
