import { formatDateTime } from "@/lib/helpers";
import {
  Briefcase,
  CircleDot,
  User,
  Tag,
  Calendar,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ActionButton from "@/components/ActionButtons";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import { getLookupBadgeStyle } from "@/lib/enums";
import { useLazyGetCustomerSetupsQuery } from "./customerSetupApi";
import type { ICustomerSetup } from "./customerSetup";
import { getPriorityColor } from "@/pages/feature-request-module/common/feature-request";

const CustomerSetups = () => {
  const [fetchQuery, fetchState] = useLazyGetCustomerSetupsQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ICustomerSetup>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Setup Code",
        accessorKey: "setupCode",
        meta: { icon: <UserRoundCog size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs">
              {row.original?.setupCode || "N/A"}
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
              : (customer?.companyName ?? "N/A");

          const softwareName =
            typeof software === "string" ? software : (software?.name ?? "N/A");
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
        header: "Setup Status",
        accessorKey: "setupStatus",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const { setupStatus } = row.original;

          const statusName =
            typeof setupStatus === "string"
              ? setupStatus
              : (setupStatus?.name ?? "N/A");

          const colorCode =
            typeof setupStatus === "string"
              ? undefined
              : setupStatus?.colorCode;

          const style = getLookupBadgeStyle(colorCode);

          return (
            <Badge
              variant={colorCode ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {statusName}
            </Badge>
          );
        },
      },
      {
        header: "Scheduled Start",
        accessorKey: "scheduledStart",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-muted-foreground text-xs">
            {row.original?.scheduledStart
              ? formatDateTime(row.original.scheduledStart)
              : "N/A"}
          </span>
        ),
      },
      {
        header: "Scheduled End",
        accessorKey: "scheduledEnd",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-muted-foreground text-xs">
            {row.original?.scheduledEnd
              ? formatDateTime(row.original.scheduledEnd)
              : "N/A"}
          </span>
        ),
      },
    ],
    [executed],
  );

  const pathOnRowSelected = (data: ICustomerSetup) => {
    const { id } = data;
    if (!id) return;

    navigate(allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER_SETUP(id));
  };

  return (
    <>
      <FeatureContentRenderer
        useDateFilters
        dateFilterNoDefault
        tableAddComponent={() => (
          <ActionButton
            type="add"
            useText="Add Customer Setup"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.ADD_CUSTOMER_SETUP)
            }
          />
        )}
        filters={[
          "priority",
          "softwareId",
          "customerId",
          "CustomerSetupStatus",
          "assignedTo",
          "setUpStatusId",
        ]}
        pathOnRowSelected={pathOnRowSelected}
        columns={columns}
        refetchData={executed}
        title="Customer Setups"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default CustomerSetups;
