import { formatDateTime } from "@/lib/helpers";
import {
  Briefcase,
  CircleDot,
  User,
  Sparkles,
  Tag
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
        meta: { icon: <Sparkles size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs">
              {row.original?.requestCode || "N/A"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.createdAt
                ? formatDateTime(row.original.createdAt)
                : "N/A"}
            </span>
          </div>
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
          const { customer, software } = row.original;

          const companyName =
            typeof customer === "string"
              ? customer
              : customer?.companyName ?? "N/A";

          const softwareName =
            typeof software === "string" ? software : software?.name ?? "N/A";
          const colorCode =
            typeof software === "string" ? undefined : software?.colorCode;
          const style = getLookupBadgeStyle(colorCode);

          return (
            <div className="flex flex-col items-start gap-1.5 py-1">
              <span className="font-semibold text-xs">{companyName}</span>
              <Badge
                variant={colorCode ? undefined : "secondary"}
                className="capitalize border text-xs font-medium px-2 py-0 rounded-full leading-tight"
                style={style}
              >
                {softwareName}
              </Badge>
            </div>
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
        dateFilterNoDefault
        filters={["featurePriority", "softwareId", "customerId", "featureStatus","assignedTo"]} 
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