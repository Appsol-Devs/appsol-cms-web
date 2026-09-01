import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleDot, Calendar, Headset, Layers, Monitor } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/helpers";
import { getComplaintStatusColor, getLookupBadgeStyle } from "@/lib/enums";
import type { IComplaint } from "../common/complaints";
import { useLazyGetCustomerComplaintsQuery } from "@/pages/customer/common/customersApi";

const CustomerComplaints = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trigger, fetchState] = useLazyGetCustomerComplaintsQuery();
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const fetchQuery = useCallback(
    (params: any) => {
      return trigger({ ...params, customerId: id });
    },
    [trigger, id],
  );

  const columns = useMemo<ColumnDef<IComplaint>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Complaint",
        accessorKey: "complaintCode",
        meta: { icon: <Headset size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.complaintCode ?? "N/A"}
            </span>
            <Badge
              variant={
                row.original.complaintType?.colorCode ? undefined : "secondary"
              }
              className="text-[11px] font-medium px-2 py-0 rounded-full"
              style={getLookupBadgeStyle(row.original.complaintType?.colorCode)}
            >
              {row.original.complaintType?.name ?? "—"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "complaintCategory",
        meta: { icon: <Layers size={14} /> },
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.complaintCategory?.colorCode
                ? undefined
                : "secondary"
            }
            className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
            style={getLookupBadgeStyle(
              row.original.complaintCategory?.colorCode,
            )}
          >
            {row.original.complaintCategory?.name ?? "—"}
          </Badge>
        ),
      },
      {
        header: "Related Software",
        accessorKey: "relatedSoftware",
        meta: { icon: <Monitor size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs text-muted-foreground">
            {row.original.relatedSoftware?.name ?? "—"}
          </span>
        ),
      },
      {
        header: "Date Logged",
        accessorKey: "createdAt",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original?.createdAt ? formatDate(row.original.createdAt) : "—"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original?.status ?? "";
          const color = getComplaintStatusColor(status);
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
        columns={columns}
        pathOnRowSelected={(row) => {
          const c = row as IComplaint;
          if (!c.id) return;

          navigate(allRoutes.PORTAL + allRoutes.VIEW_COMPLAINT(c.id), {
            state: { initialData: c, customerId: id },
          });
        }}
        refetchData={executed}
        title="Customer Complaints"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default CustomerComplaints;
