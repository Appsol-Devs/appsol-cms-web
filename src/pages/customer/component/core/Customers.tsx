import { formatDateTime } from "@/lib/helpers";
import { Briefcase, CircleDot, MapPin, Monitor, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ActionButton from "@/components/ActionButtons";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes, customerRoutes } from "@/utils/routes";
import { useLazyGetCustomersQuery } from "../../common/customersApi";
import type { ICustomer } from "../../common/customers";
import { getLookupBadgeStyle } from "@/lib/enums";

const Customers = () => {
  const [fetchQuery, fetchState] = useLazyGetCustomersQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);
  const columns = useMemo<ColumnDef<ICustomer>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Customer",
        accessorKey: "name",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.name || ""}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.createdAt
                ? formatDateTime(row.original.createdAt)
                : ""}
            </span>
          </div>
        ),
      },
      {
        header: "Business Name",
        accessorKey: "companyName",
        meta: { icon: <Briefcase size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              <Badge className="rounded-sm!">
                {row.original?.companyName ?? ""}
              </Badge>
            </span>
          </div>
        ),
      },
      {
        header: "Related Software",
        accessorKey: "software",
        meta: { icon: <Monitor size={14} /> },
        cell: ({ row }) => {
          const status = row.original.software?.name ?? "N/A";
          const colorCode = row.original.software?.colorCode;
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
      {
        header: "Location",
        accessorKey: "location",
        meta: { icon: <MapPin size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.location ?? ""}
            </span>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original.status ?? "N/A";
          const colorCode =
            row.original.status === "active"
              ? "#16a34a"
              : row.original.status === "inactive"
                ? "#dc2626"
                : undefined;

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

  const pathOnRowSelected = (data: ICustomer) => {
    const { id } = data;
    if (!id) return;

    navigate(
      allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER(id) + customerRoutes.OVERVIEW,
    );
  };

  return (
    <>
      <FeatureContentRenderer
        tableAddComponent={() => (
          <ActionButton
            type="add"
            useText="Add Customer"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_CUSTOMER)}
          />
        )}
        pathOnRowSelected={pathOnRowSelected}
        columns={columns}
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Customers"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Customers;
