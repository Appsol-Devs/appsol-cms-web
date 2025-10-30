import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  type ColumnDef,
  type SortDirection,
  type OnChangeFn,
} from "@tanstack/react-table";
import type { IPaginationState } from "@/lib/pagination";
import { PaginationComponent } from "@/components/PaginationComponent";
import FetchingError from "@/components/FetchingError";
import NoResultsFound from "@/components/NoResultsFound";
import type { Dispatch, SetStateAction } from "react";

interface CustomTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  isError?: boolean;
  noResultFound?: boolean;
  pagination?: IPaginationState;
  sortOptions?: SortingState;
  sorting?: SortingState;
  onPaginationChange?: Dispatch<SetStateAction<IPaginationState>>;
  onSortingChange?: Dispatch<SetStateAction<SortingState>>;
  hidePagination?: boolean;
  enableSorting?: boolean;
  onRowSelected?: (row: T) => void;
  refetchData?: (value: boolean) => void;
  setSorting?: OnChangeFn<SortingState>;
  noItemFoundContent?: string;
}

type IColumnSort = {
  id: string;
  desc: boolean;
};

export type SortingState = IColumnSort[];

const CustomTableComponent = <T extends object>({
  data,
  isError,
  columns,
  onPaginationChange,
  pagination,
  hidePagination,
  enableSorting,
  refetchData,
  onRowSelected,
  sorting,
  setSorting,
  noItemFoundContent,
}: CustomTableProps<T>) => {
  //state variables
  // const [sorting, setSorting] = useState<SortingState>(sortOptions || []);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting: enableSorting ? sorting : [],
    },

    pageCount: pagination?.pageCount,
    rowCount: pagination?.totalCount,
  });

  return (
    <>
      <div className="flex flex-col rounded-lg text-onCard">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="inline-block min-w-full py-4 ">
            <div className="overflow-hidden">
              <table className="w-full text-center ">
                <thead className="">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr className="w-full bg-secondary" key={headerGroup.id}>
                      {headerGroup.headers.map((header, idx) => (
                        <th
                          key={header.id}
                          //align={(header.column.columnDef.meta as any)?.align}
                          colSpan={header.colSpan}
                          className={` pl-2 px-1 w-max text-start py-3 text-xs lg:text-sm  font-medium  ${
                            idx == 0 && "rounded-l-xl"
                          } ${
                            idx == headerGroup.headers.length - 1 &&
                            "rounded-r-xl"
                          }`}
                          onClick={
                            enableSorting != null && enableSorting
                              ? header.column.getCanSort()
                                ? header.column.getToggleSortingHandler()
                                : undefined
                              : undefined
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}

                          {/* Sorting */}
                          {
                            { asc: "▲", desc: "▼", null: "" }[
                              (header.column.getIsSorted() as SortDirection) ??
                                null
                            ]
                          }
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {isError ? (
                    <tr>
                      <td colSpan={10}>
                        <FetchingError
                          refetch={() => refetchData && refetchData(true)}
                        />
                      </td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`${
                          onRowSelected ? "cursor-pointer" : "cursor-default"
                        } border-b border-solid hover:bg-muted/50 hover:text-primary bg-opacity-15 h-14`}
                        onClick={() =>
                          onRowSelected && onRowSelected(row.original)
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            className=" pl-2 text-start whitespace-nowrap p-1 text-xs lg:text-sm font-light"
                            key={cell.id}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10}>
                        <NoResultsFound
                          content={noItemFoundContent || "No results"}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {data && pagination && !hidePagination && (
          <PaginationComponent {...pagination} />
        )}
        {/* pagination */}
        {/* {data &&
                    data?.length > 0 &&hea
                    !(table.getState().pagination == undefined) ? (
                    <div>
                        <div
                            className={`flex justify-between ${hidePagination && "hidden"}`}
                        >
                            <div>
                                <span>{`Page ${table.getState().pagination.pageIndex + 1
                                    } of ${table.getPageCount()}`}</span>
                            </div>
                            <div className="flex  justify-start">
                                <div className="flex flex-row gap-2 ">
                                    <button
                                        className="p-0 w-9 h-9 border border-primary bg-transparent text-primary hover:border-primary"
                                        disabled={!table.getCanPreviousPage()}
                                        onClick={table.previousPage}
                                    >
                                        <ArrowLeft style={{ fontSize: "12px" }} />
                                    </button>
                                    <button
                                        onClick={() => table.firstPage()}
                                        className="p-0 w-9 h-9 text-xs text-white border border-primary
                  hover:border-gray-400 bg-primary"
                                    >
                                        {data?.length}
                                    </button>
                                    <button className="p-0 w-9 h-9 border bg-transparent border-gray-400 hover:border-gray-400">
                                        ...
                                    </button>
                                    <button className="p-0 w-9 h-9 text-xs bg-transparent border border-gray-400 hover:border-gray-400">
                                        {pagination?.totalCount}
                                    </button>
                                    <button
                                        className="p-0 w-9 h-9 border-[2px] border-primary bg-transparent text-primary hover:border-primary"
                                        disabled={!table.getCanNextPage()}
                                        onClick={table.nextPage}
                                    >
                                        <ArrowRight style={{ fontSize: "12px" }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null} */}
      </div>
    </>
  );
};

export default CustomTableComponent;
