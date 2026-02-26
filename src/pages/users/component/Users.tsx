import { formatDateTime } from "@/lib/helpers";
import {
  Briefcase,
  Mail,
  MailX,
  NotepadText,
  Pen,
  User,
  VerifiedIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ActionButton from "@/components/ActionButtons";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { IUser } from "@/pages/customer/common/customers";
import { useLazyGetUsersQuery } from "../common/usersApi";

const Users = () => {
  const [fetchQuery, fetchState] = useLazyGetUsersQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<IUser>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Name",
        accessorKey: "name",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.lastName || ""} {row.original?.firstName || ""}
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
        header: "Email",
        accessorKey: "email",
        meta: { icon: <Mail size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <div className="font-semibold p-0.5 text-xs flex flex-col gap-0.5">
              <Badge
                variant={row.original.isVerified ? "outline" : "outline"}
                className="rounded-sm!"
              >
                {row.original?.isVerified ? (
                  <VerifiedIcon size={10} className="w-6 h-6 text-blue-500" fill="currentColor" color="white" />
                ) : (
                  <MailX size={10} />
                )}
                {row.original?.email ?? ""}
              </Badge>
              <span className="font-semibold text-xs"></span>
            </div>
          </div>
        ),
      },
      {
        header: "Role",
        accessorKey: "role",
        meta: { icon: <Briefcase size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              <Badge variant="outline" className="rounded-sm!">
                {row.original?.role?.name ?? "N/A"}
              </Badge>
            </span>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.status ?? ""}
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
              type="view"
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.VIEW_USER(row.original._id as string), {
                  state: { initialData: row.original },
                })
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
            useText="Add User"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_USER)}
          />
        )}
        columns={columns}
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Users"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Users;
