import { formatDateTime, formatToCurrency } from "@/lib/helpers";
import type { IBaseQueryParam } from "@/lib/api";
import {
  Banknote,
  Calendar,
  FileText,
  Monitor,
  User,
  CreditCard,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import CustomerCompanyCell from "@/components/CustomerCompanyCell";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import { getLookupBadgeStyle, getPaymentStatusColor } from "@/lib/enums";
import { useLazyGetCustomerPaymentsQuery } from "../../common/customersApi";
import type { IPayment } from "@/pages/payments/common/payments";

const CustomerPayments = () => {
  const { id: routeCustomerId } = useParams<{ id: string }>();
  const { customerId: outletCustomerId } =
    useOutletContext<{ customerId?: string }>() ?? {};
  const location = useLocation();
  const navigate = useNavigate();

  const customerId = useMemo(() => {
    if (routeCustomerId) return routeCustomerId;
    if (outletCustomerId) return outletCustomerId;
    return location.pathname.match(/\/customers\/([^/]+)/)?.[1];
  }, [routeCustomerId, outletCustomerId, location.pathname]);

  const [trigger, fetchState] = useLazyGetCustomerPaymentsQuery();
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const fetchQuery = useCallback(
    (params: IBaseQueryParam) =>
      trigger({
        ...params,
        customerId,
        filters: params.filters,
      }),
    [trigger, customerId],
  );

  const columns = useMemo<ColumnDef<IPayment>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Date",
        accessorKey: "paymentDate",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.paymentDate
                ? formatDateTime(row.original.paymentDate)
                : "—"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.paymentCode ?? "—"}
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
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-semibold text-xs">
              {row.original?.software?.name ?? "—"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.subscriptionType?.name ?? "—"}
            </span>
          </div>
        ),
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
        header: "Reference",
        accessorKey: "paymentReference",
        meta: { icon: <FileText size={14} /> },
        cell: ({ row }) => (
          <span className="font-medium text-xs text-muted-foreground">
            {row.original?.paymentReference ?? "—"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CreditCard size={14} /> },
        cell: ({ row }) => {
          const status = row.original.status ?? "";
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

  if (!customerId) {
    return null;
  }

  return (
    <>
      <FeatureContentRenderer
        key={customerId}
        tableAddComponent={() => null}
        useDateFilters
        dateFilterNoDefault
        filters={["status"]}
        columns={columns}
        pathOnRowSelected={(row) => {
          const payment = row as IPayment;
          navigate(
            allRoutes.PORTAL + allRoutes.VIEW_PAYMENT(payment.id as string),
            {
              state: { initialData: payment, customerId },
            },
          );
        }}
        refetchData={executed}
        title="Customer Payments"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default CustomerPayments;
