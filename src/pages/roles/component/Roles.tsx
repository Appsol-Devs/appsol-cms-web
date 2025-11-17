import { format } from "date-fns";
import { Briefcase, NotepadText, Pen, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLazyGetRolesQuery } from "../common/rolesApi";
import ActionButton from "@/components/ActionButtons";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import type { IRole } from "@/pages/auth/login/common/login";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";

const Roles = () => {
  const [fetchQuery, fetchState] = useLazyGetRolesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);
  const columns = useMemo<ColumnDef<IRole>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Role",
        accessorKey: "role",
        meta: { icon: <Briefcase size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.name || ""}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.createdAt
                ? format(row.original.createdAt, "do MMM y hh:mm aa")
                : ""}
            </span>
          </div>
        ),
      },
      {
        header: "Permissions",
        accessorKey: "permissions",
        meta: { icon: <Shield size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              <Badge>{row.original?.permissions.length ?? ""}</Badge>
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
              {row.original.description ?? ""}
            </span>
          </div>
        ),
      },
      {
        header: "Action",
        meta: { icon: <Pen size={14} /> },
        accessorKey: "action",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <ActionButton
              type="edit"
              onClick={() =>
                navigate(
                  allRoutes.PORTAL +
                    allRoutes.UPDATE_ROLE(row.original._id as string)
                )
              }
            />
          </div>
        ),
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
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_ROLE)}
          />
        )}
        columns={columns}
        // isSetting
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Roles"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Roles;
