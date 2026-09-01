import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import CustomerCompanyCell from "@/components/CustomerCompanyCell";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleDot, Headset, Megaphone, Target, User } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getLookupBadgeStyle } from "@/lib/enums";
import type { ICustomerOutreach } from "@/pages/customer-outreaches/common/customer-outreach";
import { useLazyGetCustomerOutreachQuery } from "../../common/customersApi";
import { formatDateTime } from "@/lib/helpers";

const CustomerOutreach = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trigger, fetchState] = useLazyGetCustomerOutreachQuery();
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  // 2. Intercept table updates and attach customerId to the query payload
  const fetchQuery = useCallback(
    (params: any) => {
      return trigger({ ...params, customerId: id });
    },
    [trigger, id],
  );

  const columns = useMemo<ColumnDef<ICustomerOutreach>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Outreach Code",
        accessorKey: "outreachCode",
        meta: { icon: <Headset size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original.outreachCode ?? "N/A"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original.createdAt
                ? formatDateTime(row.original.createdAt)
                : "—"}
            </span>
          </div>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customer",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <CustomerCompanyCell customer={row.original?.customer} />
        ),
      },
      {
        header: "Outreach Type",
        accessorKey: "outreachType",
        meta: { icon: <Megaphone size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original.outreachType?.name ?? "—"}
          </span>
        ),
      },
      {
        header: "Purpose",
        accessorKey: "purpose",
        meta: { icon: <Target size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs w-32 truncate">
              {row.original.purpose ?? "N/A"}
            </span>
          </div>
        ),
      },
      {
        header: "Call Status",
        accessorKey: "callStatus",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original.callStatus?.name ?? "N/A";
          const colorCode = row.original.callStatus?.colorCode;
          const style = getLookupBadgeStyle(colorCode);
          return (
            <Badge
              variant={colorCode ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {status}
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
          const o = row as ICustomerOutreach;
          if (!o.id) return;

          navigate(allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER_OUTREACH(o.id), {
            state: { initialData: o, customerId: id },
          });
        }}
        refetchData={executed}
        title="Customer Outreach"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default CustomerOutreach;
