import { formatDateTime } from "@/lib/helpers";
import {
  Briefcase,
  CircleDot,
  Monitor,
  User,
  Hash,
  Tag,
  Users,
  Calendar
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ActionButton from "@/components/ActionButtons";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import { getLookupBadgeStyle } from "@/lib/enums";
import { getPriorityColor, getStatusColor, type IFeatureRequest } from "../common/feature-request";
import { useLazyGetFeatureRequestsQuery } from "../common/featureRequestApi";

const FeatureRequest = () => {
  const [fetchQuery, fetchState] = useLazyGetFeatureRequestsQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<IFeatureRequest>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Request Code",
        accessorKey: "requestCode",
        meta: { icon: <Hash size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original?.requestCode || "N/A"}
          </span>
        ),
      },
      {
        header: "Title",
        accessorKey: "title",
        meta: { icon: <Tag size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs truncate max-w-[150px] inline-block">
            {row.original?.title || "N/A"}
          </span>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customer",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => {
          const { customer } = row.original;
          const customerName = typeof customer === 'string' ? customer : customer?.name ?? "N/A";

          return (
            <span className="font-semibold text-xs">
              {customerName}
            </span>
          );
        },
      },
      {
        header: "Software",
        accessorKey: "software",
        meta: { icon: <Monitor size={14} /> },
        cell: ({ row }) => {
          const { software } = row.original;

          const softwareName = typeof software === 'string' ? software : software?.name ?? "N/A";
          const colorCode = typeof software === 'string' ? undefined : software?.colorCode;

          const style = getLookupBadgeStyle(colorCode);
          return (
            <Badge
              variant={colorCode ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {softwareName}
            </Badge>
          );
        },
      },
      {
        header: "Priority",
        accessorKey: "priority",
        meta: { icon: <Briefcase size={14} /> },
        cell: ({ row }) => {
          const priority = row.original.priority;
          const colorCode = getPriorityColor(priority);
          const style = getLookupBadgeStyle(colorCode);

          return (
            <Badge
              variant={colorCode ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {priority ?? "N/A"}
            </Badge>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original.status;
          const colorCode = getStatusColor(status);
          const style = getLookupBadgeStyle(colorCode);

          return (
            <Badge
              variant={colorCode ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {status ?? "N/A"}
            </Badge>
          );
        },
      },
      {
        header: "Assigned Users",
        accessorKey: "assignedTo",
        meta: { icon: <Users size={14} /> },
        cell: ({ row }) => {
          const count = row.original.assignedTo?.length || 0;
          return (
            <span className="text-xs font-medium text-muted-foreground">
              {count} {count === 1 ? 'User' : 'Users'}
            </span>
          );
        },
      },
      {
        header: "Requested Date",
        accessorKey: "requestedDate",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original?.requestedDate
              ? formatDateTime(row.original.requestedDate)
              : "N/A"}
          </span>
        ),
      },
      {
        header: "Created Date",
        accessorKey: "createdAt",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original?.createdAt
              ? formatDateTime(row.original.createdAt)
              : "N/A"}
          </span>
        ),
      },
    ],
    [executed],
  );

  const pathOnRowSelected = (data: IFeatureRequest) => {
    const { _id } = data;
    if (!_id) return;

    navigate(
      allRoutes.PORTAL + allRoutes.VIEW_FEATURE_REQUEST(_id)
    );
  };

  return (
    <>
      <FeatureContentRenderer
        tableAddComponent={() => (

          <ActionButton
            type="add"
            useText="Add Feature Request"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_FEATURE_REQUEST)}
          />
        )}
        useDateFilters
        filters={["featurePriority", "softwareId","customerId","assignedTo","featureStatus"]}
        pathOnRowSelected={pathOnRowSelected}
        columns={columns}
        refetchData={executed}
        title="Feature Requests"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default FeatureRequest;