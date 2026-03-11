import { useEffect, useState } from "react";
import { Bell, X, FileText, Check, CheckCheck, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { allRoutes } from "@/utils/routes";

import type { INotification } from "@/pages/customer/common/customers";
import {
  useLazyGetPaginatedNotificationsQuery,
  useMarkAllReadMutation,
  useMarkAsReadMutation,
} from "../common/notificationsApi";
import { formatDate } from "@/lib/helpers";
import { getLookupBadgeStyle } from "@/lib/enums";
import { showToast } from "@/components/ui/CustomToast";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [getNotifications, { isLoading }] = useLazyGetPaginatedNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const [notifications, setNotifications] = useState<INotification[]>([]);

  const fetchNotifications = async () => {
    try {
      const result = await getNotifications({ pageIndex: 1, pageSize: 50}).unwrap();
      setNotifications(result.contents || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  const modifiedNotifications = notifications
    ? [...notifications].sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
    })
    : [];

  const unreadCount = notifications.filter((n) => !n.isRead).length || 0;

  const handleMarkAsRead = async (notif: INotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
    );
    try {
      await markAsRead(String(notif._id)).unwrap();
      showToast({
        title: "Success",
        message: "Notification marked as read successfully",
        type: "success",
      });
    } catch  {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: false } : n))
      );
      showToast({
        title: "Error",
        message: "Failed to mark notification as read",
        type: "error",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const previousNotifications = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllRead().unwrap();
      showToast({
        title: "Success",
        message: "All notifications marked as read successfully",
        type: "success",
      });
    } catch {
      setNotifications(previousNotifications);
      showToast({
        title: "Error",
        message: "Failed to mark all notifications as read",
        type: "error",
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative bg-transparent! border-onSurface!">
          <Bell className="h-5 w-5 text-onSurface hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] text-white border-2 border-background"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[300px] p-0 shadow-lg rounded-sm overflow-hidden text-xs">

        <div className="flex items-center justify-between px-2 py-1.5 border-b bg-background z-10">
          <span className="font-bold text-xs">Notifications</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => setIsOpen(false)}>
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>

        <ScrollArea className="h-[210px] w-full px-2 py-1">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
          ) : modifiedNotifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No Notifications
            </div>
          ) : (
            <div className="flex flex-col gap-1 text-onSurface">
              {modifiedNotifications.map((notif) => {
                const initials = `${notif.user?.firstName?.[0] || ""}${notif.user?.lastName?.[0] || ""}`;
                const isRead = !!notif.isRead;
                const statusText = isRead ? "read" : "new";
                const colorCode = isRead ? "#16a34a" : "#eab308";
                const style = getLookupBadgeStyle(colorCode);
                return (
                  <div
                    key={notif._id}
                    className={cn(
                      "group flex items-start gap-1.5 p-1 rounded-sm transition-colors border-b last:border-0",
                      "bg-white hover:bg-blue-50 dark:bg-background dark:hover:bg-blue-900/20"
                    )}
                  >
                    {notif.user ? (
                      <Avatar className="h-6 w-6 border shrink-0 text-[10px]">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {initials.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                        <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5 flex-1 text-xs">
                      <p className="leading-tight">
                        <span className="font-bold text-onSurface">
                          @{notif.targetEntityType}
                        </span>
                        <br />
                        <span className="">{notif.message}</span>
                      </p>

                      <div className="flex items-center flex-wrap gap-1 mt-0.5">
                        <Badge
                          variant="outline"
                          className="capitalize text-[8px] font-semibold px-1 py-0 rounded-full h-3 min-h-0 flex items-center"
                          style={style}
                        >
                          {statusText}
                        </Badge>
                        <span className="text-[10px] text-gray-500 italic">
                          {formatDate(String(notif.createdAt)) || "N/A"}
                        </span>

                        {/* View Complaint  */}
                        {notif.link && notif.link.includes("complaints") && (
                          <>
                            <span className="text-muted-foreground text-[8px]">•</span>
                            <span
                              className="text-[10px] text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline cursor-pointer font-medium transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);

                                const id = notif.link?.split("/").filter(Boolean).pop();
                                if (id) {
                                  navigate(allRoutes.PORTAL + allRoutes.VIEW_COMPLAINT(id));
                                }
                              }}
                            >
                              View Complaint
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full opacity-60 hover:opacity-100 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif);
                        }}
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-1.5 border-t flex items-center gap-1.5 bg-background z-10">
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-[10px] border-muted-foreground/20 text-white!"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="mr-1 h-3 w-3 text-white!" />
              Mark all read
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1 h-7 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setIsOpen(false);
              navigate(allRoutes.PORTAL + allRoutes.ALL_NOTIFICATIONS);
            }}
          >
            <List className="mr-1 h-3 w-3" />
            View All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;