import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  type ColumnDef,
  type OnChangeFn,
  type SortDirection,
} from "@tanstack/react-table";
import FetchingError from "@/components/FetchingError";
import NoResultsFound from "@/components/NoResultsFound";
import { PaginationComponent } from "@/components/PaginationComponent";
import { cn } from "@/lib/utils";
import type { IMetaData } from "@/lib/pagination";

interface CustomTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  isError?: boolean;
  noResultFound?: boolean;
  pagination?: IMetaData;
  sortOptions?: SortingState;
  sorting?: SortingState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<IMetaData>>;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
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
  // sorting,
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
    // onPaginationChange,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    // state: {
    //   pagination,
    //   sorting: enableSorting ? sorting : [],
    // },

    pageCount: pagination?.page_number,
    rowCount: pagination?.total_pages,
  });

  return (
    <>
      <div className="flex flex-col text-onCard">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="inline-block min-w-full">
            <div className="overflow-hidden shadow-sm rounded-md bg-surface pb-1">
              <table className="w-full text-center border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className=" border-b border-x">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className={`px-3 py-3 text-xs lg:text-sm font-medium text-start cursor-pointer select-none last:rounded-tr-md first:rounded-tl-md bg-[#F0F0F0] text-[#7E8299]`}
                          onClick={
                            enableSorting
                              ? header.column.getCanSort()
                                ? header.column.getToggleSortingHandler()
                                : undefined
                              : undefined
                          }
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center gap-1">
                              {(header.column.columnDef.meta as any)?.icon && (
                                <span className="text-gray-600 flex items-center">
                                  {(header.column.columnDef.meta as any).icon}
                                </span>
                              )}
                              <span>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
                              <span className="ml-1 text-xs">
                                {
                                  { asc: "▲", desc: "▼", null: "" }[
                                    (header.column.getIsSorted() as SortDirection) ??
                                      null
                                  ]
                                }
                              </span>
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {isError ? (
                    <tr>
                      <td colSpan={10} className="p-4">
                        <FetchingError
                          refetch={() => refetchData && refetchData(true)}
                        />
                      </td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    table.getRowModel().rows.map((row, idx) => {
                      const isLastRow =
                        idx === table.getRowModel().rows.length - 1;

                      return (
                        <tr
                          key={row.id}
                          className={`${
                            onRowSelected ? "cursor-pointer" : "cursor-default"
                          } ${
                            isLastRow ? "border-x" : "border-b border-x"
                          }  bg-card text-card-foreground hover:bg-muted/60`}
                          onClick={() =>
                            onRowSelected && onRowSelected(row.original)
                          }
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={cn(
                                "px-3 py-3 text-xs lg:text-sm text-start",
                                isLastRow
                                  ? "last:rounded-br-md first:rounded-bl-md "
                                  : ""
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-4">
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
          <PaginationComponent
            pagination={pagination}
            onPaginationChange={onPaginationChange}
          />
        )}
      </div>

      {/* pagination */}
    </>
  );
};

export default CustomTableComponent;
