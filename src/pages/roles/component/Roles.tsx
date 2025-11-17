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

const sampleRoles: IRole[] = [
  {
    _id: "675abc901234abcd000001",
    name: "Admin",
    description: "Full access to the system with all permissions.",
    permissions: [
      "users:create",
      "users:read",
      "users:update",
      "users:delete",
      "roles:manage",
      "settings:update",
    ],
    isDeleted: false,
    createdAt: "2025-01-10T12:34:56.000Z",
    updatedAt: "2025-02-02T09:15:22.000Z",
    __v: 0,
  },
  {
    _id: "675abc901234abcd000002",
    name: "Manager",
    description:
      "Can manage operational aspects but cannot modify system settings.",
    permissions: [
      "users:read",
      "users:update",
      "transactions:approve",
      "reports:view",
    ],
    isDeleted: false,
    createdAt: "2025-01-12T09:10:45.000Z",
    updatedAt: "2025-01-28T14:20:10.000Z",
    __v: 0,
  },
  {
    _id: "675abc901234abcd000003",
    name: "Staff",
    description: "Basic staff role with limited operational permissions.",
    permissions: ["users:read", "transactions:create", "transactions:view"],
    isDeleted: false,
    createdAt: "2025-01-15T08:00:00.000Z",
    updatedAt: "2025-01-20T10:45:30.000Z",
    __v: 0,
  },
  {
    _id: "675abc901234abcd000004",
    name: "Viewer",
    description: "Read-only access to the system.",
    permissions: ["users:read", "reports:view"],
    isDeleted: false,
    createdAt: "2025-01-18T11:22:33.000Z",
    updatedAt: "2025-01-18T11:22:33.000Z",
    __v: 0,
  },
  {
    _id: "675abc901234abcd000005",
    name: "Archived Role",
    description: "Deprecated role no longer in active use.",
    permissions: [],
    isDeleted: true,
    createdAt: "2024-12-10T10:00:00.000Z",
    updatedAt: "2025-01-05T16:40:00.000Z",
    __v: 3,
  },
];

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
        data={sampleRoles}
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Roles"
        subtext="A preview of all system roles and permissions."
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Roles;
