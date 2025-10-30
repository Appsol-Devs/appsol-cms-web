import type { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { useState } from "react";

/**
 *
 * @param initialSize -> number
 * @param pageCount -> number
 *   const { limit, onPaginationChange, skip, pagination } = usePagination();
 */
export const usePagination = (initialSize: number = 10, pageCount?: number) => {
  const [pagination, setPagination] = useState<IPaginationState>({
    pageSize: initialSize,
    pageIndex: 0,
    pageCount: pageCount,
    totalCount: 0,
  });
  const { pageSize, pageIndex } = pagination;

  return {
    pageSize: pageSize,
    onPaginationChange: setPagination,
    pagination,
    pageIndex: pageIndex,
  };
};

export type IPaginationState = {
  pageIndex: number;
  pageSize: number;
  pageCount?: number;
  totalPages?: number;
  totalCount?: number;
};

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
              ([key]) => key.startsWith("_meta_") || key.startsWith("_metal_")
            ) // Filter headers that start with "_meta_  /#|_/g"
            .map(([key, value]) => [
              key.replace(/_meta_|_metal_/g, ""),
              Number(value),
            ]) // Remove prefix and convert to number
        ) as unknown as IMetaData),
    };
  }

  return paginationState;
};

export const getPaginationMetaDataV2 = (response: Response | undefined) => {
  let paginationState: IPagination | null = null;
  if (response) {
    const headers = response?.headers ?? {};
    paginationState = {
      totalCounts: Number(headers.get("_meta_total_count") ?? "0"),
      metaData:
        headers &&
        (Object.fromEntries(
          [...(response?.headers.entries() ?? {})]
            .filter(
              ([key]) => key.startsWith("_meta_") || key.startsWith("_metal_")
            ) // Filter headers that start with "_meta_  /#|_/g"
            .map(([key, value]) => [
              key.replace(/_meta_|_metal_/g, ""),
              Number(value),
            ]) // Remove prefix and convert to number
        ) as unknown as IMetaData),
    };
  }

  return paginationState;
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
  // has_next_page?: boolean;
  // has_prev_page?: boolean;
  // next_page?: number | null;
  // prev_page?: number | null;
}
