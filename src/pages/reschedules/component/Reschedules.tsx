import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, CircleDot, Hash, User } from "lucide-react";
import { formatDateTime } from "@/lib/helpers";
import ActionButton from "@/components/ActionButtons";
import { allRoutes } from "@/utils/routes";
import { getLookupBadgeStyle, getPaymentStatusColor } from "@/lib/enums";
import type { IReschedule } from "../common/reschedules";
import { useLazyGetReschedulesQuery } from "../common/reschedulesApi";

const Reschedules = () => {
  const [fetchQuery, fetchState] = useLazyGetReschedulesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) setTimeout(() => setExecuted(false), 2000);
  }, [executed]);

  const columns = useMemo<ColumnDef<IReschedule>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Schedule Code",
        accessorKey: "rescheduleCode",
        meta: { icon: <Hash size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.rescheduleCode ?? "—"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.title ?? "—"}
            </span>
          </div>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customer",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => {
          const customer = row.original?.customer as any;
          const name =
            typeof customer === "string"
              ? customer
              : (customer?.name ?? "N/A");
          const company =
            typeof customer === "string"
              ? ""
              : (customer?.companyName ?? "");
          return (
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-xs">{name}</span>
              <span className="font-semibold text-muted-foreground text-xs">
                {company}
              </span>
            </div>
          );
        },
      },
      {
        header: "Entity",
        accessorKey: "targetEntityType",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.targetEntityType === "CustomerSetup"
                ? "Customer Setup"
                : row.original?.targetEntityType === "CustomerOutreach"
                ? "Customer Outreach"
                : row.original?.targetEntityType === "CustomerComplaint"
                ? "Customer Complaint"
                : row.original?.targetEntityType === "SubscriptionReminder"
                ? "Subscription Reminder"
                : row.original?.targetEntityType === "Ticket"
                ? "Ticket"
                : row.original?.targetEntityType === "Generic"
                ? "Generic"
                : "—"}
            </span>
          </div>
        ),
      },
      {
        header: "Original Date",
        accessorKey: "originalDateTime",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original?.originalDateTime
              ? formatDateTime(row.original.originalDateTime)
              : "—"}
          </span>
        ),
      },
      {
        header: "New Date",
        accessorKey: "newDateTime",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original?.newDateTime
              ? formatDateTime(row.original.newDateTime)
              : "—"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original?.status ?? "";
          const color = getPaymentStatusColor(status);
          const style = getLookupBadgeStyle(color);
          return (
            <Badge
              variant={color ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {status || "N/A"}
            </Badge>
          );
        },
      },
    ],
    [executed],
  );

  return (
    <>
      <FeatureContentRenderer
        useDateFilters
        filters={["customerId", "status", "targetEntityType", "loggedBy"]}
        columns={columns}
        tableAddComponent={() => (
          <div className="flex items-center gap-2">
            <ActionButton
              type="view"
              useText="Scheduler"
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.RESCHEDULES_SCHEDULER)
              }
            />
            <ActionButton
              type="add"
              useText="Add Schedules"
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.ADD_RESCHEDULE)
              }
            />
          </div>
        )}
        pathOnRowSelected={(row) => {
          const reschedule = row as IReschedule;
          if (reschedule?._id) {
            navigate(
              allRoutes.PORTAL + allRoutes.VIEW_RESCHEDULE(reschedule._id),
              { state: { initialData: reschedule } },
            );
          }
        }}
        refetchData={executed}
        title="Schedules"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Reschedules;

