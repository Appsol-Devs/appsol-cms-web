import ActionButton from "@/components/ActionButtons";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Check, Calendar, CircleDot } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { INotification } from "@/pages/customer/common/customers";
import { Badge } from "@/components/ui/badge";
import {
  useLazyGetPaginatedNotificationsQuery,
  useMarkAsReadMutation,
} from "../common/notificationsApi";
import { formatDate } from "@/lib/helpers";
import { allRoutes } from "@/utils/routes";
import { useNavigate } from "react-router-dom";
import { getLookupBadgeStyle } from "@/lib/enums";
import { showToast } from "@/components/ui/CustomToast";

const AllNotifications = () => {
  const [fetchQuery, fetchState] = useLazyGetPaginatedNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      setExecuted(true);
      showToast({
        title: "Success",
        message: "Notification marked as read successfully",
        type: "success",
      });
    } catch {
      showToast({
        title: "Error",
        message: "Failed to mark notification as read",
        type: "error",
      });
    }
  };

  const columns = useMemo<ColumnDef<INotification>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Notification",
        accessorKey: "message",
        meta: { icon: <FileText size={14} /> },
        cell: ({ row }) => {
          const hasComplaintLink =
            row.original.link && row.original.link.includes("complaints");

          return (
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-xs">
                {row.original?.message ?? "N/A"}
              </span>

              {hasComplaintLink ? (
                <span
                  className="text-[10px] text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer font-medium transition-colors"
                  onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                    e.stopPropagation();
                    const id = row.original.link
                      ?.split("/")
                      .filter(Boolean)
                      .pop();
                    if (id) {
                      navigate(allRoutes.PORTAL + allRoutes.VIEW_COMPLAINT(id));
                    }
                  }}
                >
                  {row.original.targetEntityType}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  {row.original.targetEntityType}
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "isRead",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const isRead = row.original.isRead;
          const statusText = isRead ? "Read" : "Unread";
          const colorCode = isRead ? "#16a34a" : "#dc2626";
          const style = getLookupBadgeStyle(colorCode);
          return (
            <Badge
              variant={colorCode ? undefined : "secondary"}
              className="capitalize border text-[11px] font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {statusText}
            </Badge>
          );
        },
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="text-xs font-medium">
            {formatDate(String(row.original.createdAt)) || "N/A"}
          </span>
        ),
      },
      {
        header: "Action",
        meta: { icon: <Check size={14} /> },
        accessorKey: "action",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            {!row.original.isRead ? (
              <ActionButton
                type="edit"
                useText="Mark Read"
                onClick={() => {
                  handleMarkAsRead(String(row.original.id));
                }}
              />
            ) : (
              <span className="text-xs text-muted-foreground pl-2">-</span>
            )}
          </div>
        ),
      },
    ],
    [executed],
  );

  return (
    <>
      <FeatureContentRenderer
        columns={columns}
        refetchData={executed}
        title="All Notifications"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default AllNotifications;
