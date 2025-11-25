import ActionButton from "@/components/ActionButtons";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, NotepadText, Pen, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IComplaint } from "../common/complaints";
import { useLazyGetComplaintsQuery } from "../common/complaintsApi";
import { format } from "date-fns";

const Complaints = () => {
  const [fetchQuery, fetchState] = useLazyGetComplaintsQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<IComplaint>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="">
              {row.original?.complaintType?.name ?? "N/A"}
            </span>
            <Badge>{row.original.complaintCode}</Badge>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.createdAt
                ? format(row.original.createdAt, "do MMM y hh:mm aa")
                : ""}
            </span>
          </div>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customerId",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <p className="font-semibold p-0.5 text-xs flex flex-col gap-0.5">
              <span className="">{row.original?.customer?.name ?? "N/A"}</span>
              <span className="">{row.original?.customer?.phone ?? "N/A"}</span>
            </p>
          </div>
        ),
      },
      {
        header: "Logged By",
        accessorKey: "loggedBy",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => {
          const loggerName =
            row.original?.loggedBy?.firstName +
            " " +
            row.original?.loggedBy?.lastName;

          return (
            <div className=" flex flex-col items-start gap-1">
              <p className="font-semibold p-0.5 text-xs flex flex-col gap-0.5">
                <span className="">{loggerName ?? "N/A"}</span>
                <span className="">
                  {row.original?.loggedBy?.email ?? "N/A"}
                </span>
              </p>
            </div>
          );
        },
      },
      {
        header: "Description",
        accessorKey: "description",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.description ?? "-"}
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
              {row.original.status ?? ""}
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
                    allRoutes.VIEW_COMPLAINT(row.original._id as string)
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
            useText="Add Complaint"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_COMPLAINT)}
          />
        )}
        columns={columns}
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Complaints"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Complaints;
