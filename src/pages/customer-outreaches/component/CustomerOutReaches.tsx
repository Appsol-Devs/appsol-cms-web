import ActionButton from "@/components/ActionButtons";
import CustomerCompanyCell from "@/components/CustomerCompanyCell";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleDot, Headset, Megaphone, Target, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useLazyGetCustomerOutReachesQuery } from "../common/customerOutreachApi";
import type { ICustomerOutreach } from "../common/customer-outreach";
import { getLookupBadgeStyle } from "@/lib/enums";
import { formatDateTime } from "@/lib/helpers";

const CustomerOutReaches = () => {
  const [fetchQuery, fetchState] = useLazyGetCustomerOutReachesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ICustomerOutreach>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      // {
      //   header: "User",
      //   accessorKey: "name",
      //   meta: { icon: <User size={14} /> },
      //   cell: ({ row }) => (
      //     <div className=" flex flex-col items-start gap-1">
      //       <span className="font-semibold text-xs">
      //         {row.original?.loggedBy?.firstName || ""} {row.original?.loggedBy?.lastName || ""}
      //       </span>
      //       <span className="font-semibold text-muted-foreground text-xs">
      //         {row.original?.createdAt
      //           ? format(row.original.createdAt, "do MMM y hh:mm aa")
      //           : ""}
      //       </span>
      //     </div>
      //   ),
      // },
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
          <div className=" flex flex-col items-start gap-1">
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
        tableAddComponent={() => (
          <ActionButton
            type="add"
            useText="Add Customer Outreach"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.ADD_CUSTOMER_OUTREACH)
            }
          />
        )}
        columns={columns}
        pathOnRowSelected={(row) => {
          const o = row as ICustomerOutreach;
          if (!o._id) return;
          navigate(allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER_OUTREACH(o._id), {
            state: { initialData: o },
          });
        }}
        useDateFilters
        dateFilterNoDefault
        filters={[
          "outreachStatus",
          "customerId",
          "outreachTypeId",
          "callStatusId",
        ]}
        refetchData={executed}
        title="Customer Outreach"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default CustomerOutReaches;
