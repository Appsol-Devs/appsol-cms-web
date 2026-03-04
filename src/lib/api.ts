import type { IFilters } from "./pagination";

export const prepareApiHeaders = (headers: Headers) => {
  if (localStorage.length > 2) {
    const authHeadersString: string | null =
      localStorage.getItem("auth_headers");

    if (authHeadersString !== null) {
      const auth_headers = JSON.parse(authHeadersString);
      headers.set("Authorization", `Bearer ${auth_headers["accessToken"]}`);
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
    return headers;
  }
};

export interface IBaseQueryParam {
  pageIndex?: number;
  paginate?: boolean;
  pageSize?: number;
  search?: string;
  id?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  filters?: IFilters;
}

export const lookup_params: IBaseQueryParam = {
  pageSize: 1000,
  pageIndex: 1,
};
