import CardComponent from "@/components/CardComponent";
import DateRangeComponent, {
  type IDateRange,
} from "@/components/DateRangePicker";
import LoadingComponent from "@/components/LoadingComponent";
import PageTitle from "@/components/PageTitle";
import SearchComponent from "@/components/SearchComponent";
import { showToast } from "@/components/ui/CustomToast";
import type { IBaseQueryParam } from "@/lib/api";
import { usePagination, type IMetaData } from "@/lib/pagination";
import { isUserLoggedIn } from "@/lib/utils";
import type { SerializedError } from "@reduxjs/toolkit";
import type {
  FetchBaseQueryError,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import type { ColumnDef } from "@tanstack/react-table";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LazyGetTriggerType } from "../common/table";
import ReusableTable from "./ReusableTable";

interface ITableTemplate<
  Q = any,
  R extends QueryDefinition<any, any, any, any, string> = any
> {
  title: string;
  isSetting?: boolean;
  subtext?: string;
  data?: R[];
  id?: string;
  userId?: string;
  columns: ColumnDef<R>[];
  refetchData?: boolean;
  useDateFilters?: boolean;
  // filters?: IFilterArray[];
  pathOnRowSelected?: string;
  tableAddComponent?: () => React.ReactNode;
  lazyFetchQuery: [
    LazyGetTriggerType<any, { contents: R[]; pagination: any }>,
    {
      data?: { contents: R[] };
      error?: SerializedError | FetchBaseQueryError;
      isLoading: boolean;
      isFetching: boolean;
      isError: boolean;
      isSuccess: boolean;
      originalArgs?: Q;
    }
  ];
  // initialQueryFilters?: IFilters;
}

const FeatureContentRenderer = <
  T extends object,
  Q = any,
  R extends QueryDefinition<any, any, any, any, string> = any
>({
  title,
  columns,
  // filters,
  data,
  tableAddComponent,
  lazyFetchQuery,
  // subtext,
  id,
  userId,
  pathOnRowSelected,
  isSetting,
  useDateFilters,
  // initialQueryFilters,
  refetchData,
}: ITableTemplate<T>) => {
  const [allData, setAllData] = useState<R[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const { onPaginationChange, pagination, page_number = 1 } = usePagination();
  // const navigate = useNavigate();
  const [fetchQuery, { isLoading, isFetching, isSuccess, isError }] =
    lazyFetchQuery;
  const navigate = useNavigate();
  const [totalCounts, setTotalCounts] = useState(0);
  const [refetch, setRefetch] = useState(false);
  // const [queryFilters, setQueryFilters] = useState<IFilters | undefined>(
  //   undefined
  // );
  // const [toggleFilters, setToggleFilters] = useState<boolean>(false);
  const [initialFiltersApplied, setInitialFiltersApplied] = useState(false);
  const [dateRange, setDateRange] = useState<IDateRange | null>(null);

  // Update query parameters
  const updateQueryParams = (paramsToUpdate: Record<string, string | null>) => {
    const params = new URLSearchParams(location.search);
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    navigate({
      pathname: location.pathname,
      search: `?${params.toString()}`,
    });
  };

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const startDateParam = params.get("start_date");
    const endDateParam = params.get("end_date");
    const searchParam = params.get("search");

    const today = new Date();

    const start = useDateFilters
      ? startDateParam
        ? new Date(startDateParam)
        : startOfDay(today)
      : null;
    const end = useDateFilters
      ? endDateParam
        ? new Date(endDateParam)
        : endOfDay(today)
      : null;

    setDateRange({ start, end });
    setSearchQuery(searchParam ?? "");

    // Always apply date range
    // let initialFilters: IFilters = {
    //   startDate: start ? start.toISOString() : undefined,
    //   endDate: end ? end.toISOString() : undefined,
    // };

    // setQueryFilters(initialFilters);
    setInitialFiltersApplied(true);
  }, []);

  // Keep query params in sync when search or date changes
  useEffect(() => {
    if (!dateRange) return;

    updateQueryParams({
      search: searchQuery || null,
      startDate:
        useDateFilters && dateRange.start
          ? dateRange.start?.toISOString()
          : null,
      endDate:
        useDateFilters && dateRange.end ? dateRange.end?.toISOString() : null,
    });
  }, [searchQuery, dateRange]);

  useEffect(() => {
    if (refetchData) {
      setRefetch(true);
    }
  }, [refetchData]);

  const fetchData = async () => {
    const params: IBaseQueryParam = {
      search: searchQuery as string,
      pageIndex: page_number,
      // paginate: true,
      pageSize: 10,
      id: id,
      userId: userId,
      // filters: { ...queryFilters, ...initialQueryFilters },
    };

    if ((isUserLoggedIn() && lazyFetchQuery) || refetchData || searchQuery) {
      try {
        if (fetchQuery) {
          await fetchQuery(params as Q)
            .unwrap()
            .then((res) => {
              if (res) {
                // DATA
                setAllData(res.contents as R[]);

                // PAGINATION (from transformResponse → getPaginationMetaDataV2)
                const metaHeaders = res.pagination.metaData ?? {};

                const meta: IMetaData = {
                  total_count: Number(metaHeaders.total_count ?? 0),
                  total_pages: Number(metaHeaders.total_pages ?? 0),
                  page_number: Number(metaHeaders.page_number ?? 1),
                  page_size: Number(metaHeaders.page_size ?? 10),
                  // has_next_page: metaHeaders.has_next_page === "true",
                  // has_prev_page: metaHeaders.has_prev_page === "true",
                  // next_page:
                  //   metaHeaders.next_page === "null"
                  //     ? null
                  //     : Number(metaHeaders.next_page),
                  // prev_page:
                  //   metaHeaders.prev_page === "null"
                  //     ? null
                  //     : Number(metaHeaders.prev_page),
                };

                onPaginationChange(meta);
                setTotalCounts(meta.total_count || 0);
              }
            });
          setRefetch(false);
        }
      } catch (e) {
        if (!e) return;
      }
    }
  };

  useEffect(() => {
    if (!initialFiltersApplied) return;
    // if (useDateFilters && !queryFilters?.startDate && !queryFilters?.endDate)
    //   return;
    fetchData();
  }, [searchQuery, page_number, refetch, initialFiltersApplied]);

  const handleSearchKeyReturn = (searchKey: string | null) => {
    if (searchKey) {
      setSearchQuery(searchKey);
    } else {
      setSearchQuery(null);
    }
  };

  // const handleSelectedFilters = (filters: IFilters) => {
  //   if (filters) {
  //     setQueryFilters(filters);
  //   }
  // };

  return (
    <>
      <div
        className={`space-y-1 md:space-y-2 ${isSetting ? "" : " "} relative`}
      >
        <div className="rounded-3xl flex items-center justify-between">
          <PageTitle isSmaller={isSetting} title={title} />
          {tableAddComponent?.()}
        </div>
        <CardComponent
          className="min-h-[50vh] rounded-md"
          headerTitle={
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between w-full">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-thin flex flex-col">
                    <span className="text-[10px]">Total Records</span>
                    <span className="text-lg md:text-2xl font-bold">
                      {totalCounts || 0}
                    </span>{" "}
                  </p>
                  <SearchComponent returnSearchKey={handleSearchKeyReturn} />
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  {useDateFilters && (
                    <DateRangeComponent
                      dateRange={(newRange) => {
                        setDateRange(newRange);
                        // setQueryFilters((prev) => ({
                        //   ...prev,
                        //   startDate: newRange.start?.toISOString(),
                        //   endDate: newRange.end?.toISOString(),
                        // }));
                      }}
                      defaultDate={dateRange || undefined}
                    />
                  )}
                  {/* {filters && (
                    <ButtonComponent
                      onSubmit={() => setToggleFilters((prev) => !prev)}
                      className="w-max bg-rx-secondary text-rx-secondary-foreground rounded-full"
                      size="icon"
                    >
                      {toggleFilters ? (
                        <FilterX width={8} />
                      ) : (
                        <FilterIcon width={8} />
                      )}
                    </ButtonComponent>
                  )} */}
                  {/* <DateRangeComponent dateRange={() => {}} /> */}
                </div>
              </div>
              {/* {filters && (
                <div>
                  <FiltersTemplate
                    toggleFilter={toggleFilters}
                    filters={filters}
                    selectedFilters={queryFilters}
                    returnFilters={handleSelectedFilters}
                  />
                </div>
              )} */}
            </div>
          }
        >
          {isFetching || isLoading ? (
            <LoadingComponent loading={isFetching || isLoading} />
          ) : isSuccess || isError ? (
            <ReusableTable
              pathOnRowSelected={pathOnRowSelected}
              isError={isError}
              refetch={() => setRefetch(true)}
              columns={columns}
              data={data ? data : allData}
              onPaginationChange={onPaginationChange}
              pagination={pagination}
            />
          ) : null}
        </CardComponent>
      </div>
    </>
  );
};

export default FeatureContentRenderer;
