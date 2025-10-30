import type { ColumnDef } from "@tanstack/react-table";
import type { SerializedError } from "@reduxjs/toolkit";
import type { QueryDefinition } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useState, useEffect } from "react";
import ReusableTable from "./ReusableTable";
import type { LazyGetTriggerType } from "../common/table";
import type { IBaseQueryParam } from "@/lib/api";
import { isUserLoggedIn } from "@/lib/utils";
import CardComponent from "@/components/CardComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { showToast } from "@/components/ui/CustomToast";
import { usePagination } from "@/lib/pagination";
import PageTitle from "@/components/PageTitle";
// import type { IFilterArray, IFilters } from "@/components/filters-template/filters";
// import type { FilterIcon } from "lucide-react";
// import ButtonComponent from "@/components/ButtonComponent";

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

const TableTemplate = <
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
  subtext,
  id,
  userId,
  pathOnRowSelected,
  isSetting,
  // initialQueryFilters,
  refetchData,
}: ITableTemplate<T>) => {
  const [allData, setAllData] = useState<R[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const { onPaginationChange, pagination, pageIndex } = usePagination();
  // const navigate = useNavigate();
  const [fetchQuery, { isLoading, isFetching, isSuccess, isError }] =
    lazyFetchQuery;
  const [totalCounts, setTotalCounts] = useState(0);
  const [refetch, setRefetch] = useState(false);
  const isLoggedIn = isUserLoggedIn();
  // const [queryFilters, setQueryFilters] = useState<IFilters | undefined>(
  //   undefined
  // );
  // const [toggleFilters, setToggleFilters] = useState<boolean>(false);

  useEffect(() => {
    if (refetchData) {
      setRefetch(true);
    }
  }, [refetchData]);

  useEffect(() => {
    const params: IBaseQueryParam = {
      search: searchQuery as string,
      page: pageIndex + 1,
      paginate: true,
      size: 10,
      id: id,
      userId: userId,
      // filters: { ...queryFilters, ...initialQueryFilters },
    };
    if ((isLoggedIn && lazyFetchQuery) || refetchData || searchQuery) {
      if (fetchQuery) {
        fetchQuery(params as Q)
          .unwrap()
          .then((res) => {
            if (res) {
              setAllData(res.contents as R[]);
              onPaginationChange({
                ...pagination,
                totalCount: res.pagination.totalCounts,
              });
              setTotalCounts(res.pagination.totalCounts);
              // console.log("pagination", res.pagination);
            } else {
              showToast({
                title: "Fetch Error",
                message: "Could not fetch data",
                type: "error",
              });
            }
          })
          .catch(() => {
            showToast({
              title: "Fetch Error",
              message: "Error fetching data",
              type: "error",
            });
          });
        setRefetch(false);
      }
    }
  }, [isLoggedIn, searchQuery, pageIndex, refetch]);

  // const handleSearchKeyReturn = (searchKey: string | null) => {
  //   if (searchKey) {
  //     setSearchQuery(searchKey);
  //   } else {
  //     setSearchQuery(null);
  //   }
  // };

  // const handleSelectedFilters = (filters: IFilters) => {
  //   if (filters) {
  //     setQueryFilters(filters);
  //   }
  // };

  return (
    <>
      <div
        className={`space-y-2 md:space-y-4 ${
          isSetting ? "" : "md:p-6 p-2"
        } relative`}
      >
        <div className="flex items-center justify-between">
          <PageTitle isSmaller={isSetting} title={title} subtext={subtext} />
          {tableAddComponent?.()}
        </div>
        <CardComponent
          className="min-h-[50vh]"
          headerTitle={
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between w-full">
                <p className="text-sm font-thin">
                  <span className="text-lg md:text-2xl font-bold">
                    {totalCounts || 0}
                  </span>{" "}
                  {totalCounts === 1 ? "record" : "records"}
                </p>
                <div className="flex items-center space-x-2 md:space-x-3">
                  {/* {filters && (
                    <Button
                      onClick={() => setToggleFilters((prev) => !prev)}
                      className="w-max bg-rx-primary text-rx-primary-foreground"
                      size="icon"
                    >
                      <FilterIcon width={15} />
                    </Button>
                  )} */}
                  {/* <SearchComponent returnSearchKey={handleSearchKeyReturn} /> */}
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
              data={allData || data}
              onPaginationChange={onPaginationChange}
              pagination={pagination}
            />
          ) : null}
        </CardComponent>
      </div>
    </>
  );
};

export default TableTemplate;
