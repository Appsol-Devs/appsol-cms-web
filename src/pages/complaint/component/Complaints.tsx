import { formatDateTime } from "@/lib/helpers";
import {
  CircleDot,
  FileWarning,
  FolderOpen,
  Monitor,
  NotepadText,
  User,
} from "lucide-react";
import ActionButton from "@/components/ActionButtons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { IComplaint } from "../common/complaints";
import { useLazyGetComplaintsQuery } from "../common/complaintsApi";
import { getComplaintStatusColor, getLookupBadgeStyle } from "@/lib/enums";

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
        header: "Customer",
        accessorKey: "customerId",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.customer?.name ?? "N/A"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.customer?.phone ?? "N/A"}
            </span>
          </div>
        ),
      },
      {
        header: "Complaint Type",
        accessorKey: "complaintType",
        meta: { icon: <FileWarning size={14} /> },
        cell: ({ row }) => {
          const color = row.original.complaintType?.colorCode;
          const style = getLookupBadgeStyle(color);

          return (
            <div className=" flex flex-col items-start gap-1">
              <span className="font-semibold p-0.5 text-xs">
                {row.original.complaintType?.name ?? "N/A"}
              </span>
              <Badge
                variant={color ? undefined : "secondary"}
                className="capitalize border text-[11px] font-medium px-2 py-0 rounded-full bg-primary"
                style={style}
              >
                {row.original.complaintCode ?? "-"}
              </Badge>
              <span className="font-semibold text-muted-foreground text-xs">
                {row.original?.createdAt
                ? formatDateTime(row.original.createdAt)
                : ""}
              </span>
            </div>
          );
        },
      },
      {
        header: "Related Software",
        accessorKey: "relatedSoftware",
        meta: { icon: <Monitor size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.relatedSoftware?.name ?? "N/A"}
            </span>
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
              {row.original.description ?? "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "complaintCategory",
        meta: { icon: <FolderOpen size={14} /> },
        cell: ({ row }) => {
          const color = row.original.complaintCategory?.colorCode;
          const style = getLookupBadgeStyle(color);

          return (
            <div className=" flex flex-col items-start gap-1">
              <Badge
                variant={color ? undefined : "secondary"}
                className="capitalize border text-[11px] font-medium px-2 py-0 rounded-full"
                style={style}
              >
                {row.original.complaintCategory?.name ?? "N/A"}
              </Badge>
            </div>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original.status ?? "";
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
        pathOnRowSelected={(row) => {
          const complaint = row as IComplaint;
          navigate(allRoutes.PORTAL + allRoutes.VIEW_COMPLAINT(complaint._id as string), {
            state: { initialData: complaint },
          });
        }}
        useDateFilters
        dateFilterNoDefault
        filters={[
          "complaintStatus",
          "customerId",
          "complaintTypeId",
          "complaintCategoryId",
          "relatedSoftwareId",
        ]}
        refetchData={executed}
        title="Complaints"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Complaints;
