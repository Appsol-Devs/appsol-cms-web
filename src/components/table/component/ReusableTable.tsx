import CustomTableComponent from "./CustomTableComponent";
import type { QueryDefinition } from "@reduxjs/toolkit/query";
import type { ColumnDef } from "@tanstack/react-table";
import type { IMetaData } from "@/lib/pagination";

interface ReusableTableProps<
  T extends object = any,
  R extends QueryDefinition<any, any, any, any, string> = any
> {
  data: T[] | R[];
  onPaginationChange: React.Dispatch<React.SetStateAction<IMetaData>>;
  pagination: IMetaData;
  columns: ColumnDef<T>[];
  hidePagination?: boolean;
  isError?: boolean;
  refetch?: () => void;
  pathOnRowSelected?: string;
  // sortOptions?: SortingState;
  // setSorting: Dispatch<SetStateAction<SortingState>>;
  // sorting: SortingState;
}
const ReusableTable = <T extends object>({
  data,
  onPaginationChange,
  pagination,
  columns,
  refetch,
  isError,
  // pathOnRowSelected,
  hidePagination = false,
}: ReusableTableProps<T>) => {
  // const navigate = useNavigate();

  // const navigateToPath = (data: T) => {
  //     if (pathOnRowSelected) {
  //         navigate(`${pathOnRowSelected}/${data?.id}`, {
  //             state: { data: data },
  //         });
  //     }
  // };

  return (
    <>
      <CustomTableComponent
        isError={isError}
        data={data}
        columns={columns}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        hidePagination={hidePagination}
        refetchData={() => refetch?.()}
        // onRowSelected={navigateToPath}
        // sortOptions={sortOptions}
        // enableSorting={true}
        // setSorting={setSorting}
        // sorting={sorting}
      />
    </>
  );
};

export default ReusableTable;
