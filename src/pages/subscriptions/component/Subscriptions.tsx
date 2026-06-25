import { formatDateTime, formatToCurrency } from "@/lib/helpers";
import {
  AlertCircle,
  Banknote,
  Calendar,
  CircleDot,
  Monitor,
  Receipt,
  User,
} from "lucide-react";
import ActionButton from "@/components/ActionButtons";
import CustomerCompanyCell from "@/components/CustomerCompanyCell";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ISubscription } from "../common/subscriptions";
import { useLazyGetSubscriptionsQuery } from "../common/subscriptionsApi";
import {
  getDueStatus,
  getLookupBadgeStyle,
  getSubscriptionStatusColor,
} from "@/lib/enums";

const Subscriptions = () => {
  const [fetchQuery, fetchState] = useLazyGetSubscriptionsQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ISubscription>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Subscription Code",
        accessorKey: "subscriptionCode",
        meta: { icon: <Receipt size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-semibold text-xs">
              {row.original?.subscriptionCode ?? "—"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.createdAt
                ? formatDateTime(row.original.createdAt)
                : "—"}
            </span>
          </div>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customerId",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <CustomerCompanyCell customer={row.original?.customer} />
        ),
      },
      {
        header: "Software",
        accessorKey: "softwareId",
        meta: { icon: <Monitor size={14} /> },
        cell: ({ row }) => {
          const color = row.original.software?.colorCode;
          const style = getLookupBadgeStyle(color);
          return (
            <Badge
              variant={color ? undefined : "secondary"}
              className="capitalize border text-[11px] font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {row.original?.software?.name ?? "N/A"}
            </Badge>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original.status ?? "";
          const color = getSubscriptionStatusColor(status);
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
      {
        header: "Amount",
        accessorKey: "amount",
        meta: { icon: <Banknote size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {formatToCurrency(row.original?.amount ?? 0)}
          </span>
        ),
      },
      {
        header: "Next Billing",
        accessorKey: "nextBillingDate",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-muted-foreground text-xs">
            {row.original?.nextBillingDate
              ? formatDateTime(row.original.nextBillingDate)
              : "—"}
          </span>
        ),
      },
      {
        header: "Due Status",
        accessorKey: "nextBillingDate",
        meta: { icon: <AlertCircle size={14} /> },
        cell: ({ row }) => {
          const dueInfo = getDueStatus(row.original?.nextBillingDate);
          if (!dueInfo) return <span className="text-xs text-muted-foreground">—</span>;
          const style = getLookupBadgeStyle(dueInfo.color);
          return (
            <Badge
              variant={dueInfo.color ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {dueInfo.label}
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
            useText="Add Subscription"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.ADD_SUBSCRIPTION)
            }
          />
        )}
        columns={columns}
        pathOnRowSelected={(row) => {
          const subscription = row as ISubscription;
          navigate(allRoutes.PORTAL + allRoutes.VIEW_SUBSCRIPTION(subscription._id as string), {
            state: { initialData: subscription },
          });
        }}
        refetchData={executed}
        title="Subscriptions"
        filters={[
          "subscriptionStatus",
          "customerId",
          "softwareId",
          "subscriptionTypeId",
        ]}
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Subscriptions;
