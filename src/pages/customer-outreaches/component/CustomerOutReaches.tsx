import ActionButton from "@/components/ActionButtons";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { NotepadText, File, Pen, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useLazyGetCustomerOutReachesQuery } from "../common/customerOutreachApi";
import type { ICustomerOutreach } from "../common/customer-outreach";
import { formatDateTime } from "@/lib/helpers";

const CustomerOutReaches = () => {
  const [fetchQuery, fetchState] = useLazyGetCustomerOutReachesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ICustomerOutreach>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "User",
        accessorKey: "name",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.loggedBy?.firstName || ""} {row.original?.loggedBy?.lastName || ""}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.createdAt
                ? formatDateTime(row.original.createdAt)
                : ""}
            </span>
          </div>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customer",
        meta: { icon: <File size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="">
              {row.original?.customer?.name ?? "N/A"}
            </span>
            <Badge>{row.original.outreachCode}</Badge>

          </div>
        ),
      },

      {
        header: "Description",
        accessorKey: "description",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.outreachType?.name ?? "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Purpose",
        accessorKey: "purpose",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.purpose ?? "N/A"}
            </span>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.callStatus.name ?? "N/A"}
            </span>
          </div>
        ),
      },
      {
        header: "Action",
        meta: { icon: <Pen size={14} /> },
        accessorKey: "action",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <ActionButton
              type="view"
              onClick={() =>
                navigate(
                  allRoutes.PORTAL +
                    allRoutes.VIEW_CUSTOMER_OUTREACH(row.original._id as string),
                  { state: { initialData: row.original } }
                )
              }
            />
          </div>
        ),
      },


    ],
    [executed]
  );

  return (
    <>
      <FeatureContentRenderer
        tableAddComponent={() => (
          <ActionButton
            type="add"
            useText="Add Customer Outreach"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_CUSTOMER_OUTREACH)}
          />
        )}
        columns={columns}
        refetchData={executed}
        title="Customer Outreach"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default CustomerOutReaches;
