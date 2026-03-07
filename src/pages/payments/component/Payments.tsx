import { formatDateTime, formatToCurrency } from "@/lib/helpers";
import { Banknote, Calendar, Monitor, User, CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { IPayment } from "../common/payments";
import { useLazyGetPaymentsQuery } from "../common/paymentsApi";
import { getLookupBadgeStyle, getPaymentStatusColor } from "@/lib/enums";

const Payments = () => {
  const [fetchQuery, fetchState] = useLazyGetPaymentsQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<IPayment>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Code",
        accessorKey: "paymentCode",
        meta: { icon: <CreditCard size={14} /> },
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className="capitalize border text-[11px] font-medium px-2 py-0 rounded-full bg-primary"
          >
            {row.original?.paymentCode ?? "—"}
          </Badge>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customerId",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.customer?.name ?? "N/A"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.customer?.companyName ?? "N/A"}
            </span>
          </div>
        ),
      },
      {
        header: "Software",
        accessorKey: "softwareId",
        meta: { icon: <Monitor size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original?.software?.name ?? "N/A"}
          </span>
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
      {
        header: "Payment Date",
        accessorKey: "paymentDate",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-muted-foreground text-xs">
            {row.original?.paymentDate
              ? formatDateTime(row.original.paymentDate)
              : "—"}
          </span>
        ),
      },
    ],
    [executed]
  );

  return (
    <>
      <FeatureContentRenderer
        tableAddComponent={() => null}
        useDateFilters
        filters={["status"]}
        columns={columns}
        pathOnRowSelected={(row) => {
          const payment = row as IPayment;
          navigate(allRoutes.PORTAL + allRoutes.VIEW_PAYMENT(payment._id as string), {
            state: { initialData: payment },
          });
        }}
        refetchData={executed}
        title="Payments"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Payments;
