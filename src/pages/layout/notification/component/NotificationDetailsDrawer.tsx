import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/helpers";
import { getLookupBadgeStyle } from "@/lib/enums";
import {
  Bell,
  Calendar,
  Check,
  Database,
  Hash,
  Link as LinkIcon,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import type { INotification } from "@/pages/customer/common/customers";

export interface NotificationDetailsDrawerProps {
  notification: INotification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead?: (notif: INotification) => void;
}

const NotificationDetailsDrawer = ({
  notification,
  open,
  onOpenChange,
  onMarkAsRead,
}: NotificationDetailsDrawerProps) => {
  const navigate = useNavigate();

  const isRead = !!notification?.isRead;
  const statusText = isRead ? "Read" : "Unread";
  const colorCode = isRead ? "#16a34a" : "#eab308";
  const statusStyle = getLookupBadgeStyle(colorCode);

  const hasComplaintLink =
    notification?.link && notification.link.includes("complaints");
  const showActionsSection = hasComplaintLink || (!isRead && onMarkAsRead);

  const handleNavigateToComplaint = () => {
    if (!notification?.link) return;

    onOpenChange(false);

    const id = notification.link.split("/").filter(Boolean).pop();
    if (id) {
      navigate(allRoutes.PORTAL + allRoutes.VIEW_COMPLAINT(id));
    }
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[calc(100vh-2rem)] sm:max-w-lg !top-4 !right-4 !bottom-4 data-[vaul-drawer-direction=right]:!top-4 data-[vaul-drawer-direction=right]:!right-4 data-[vaul-drawer-direction=right]:!bottom-4 data-[vaul-drawer-direction=right]:rounded-xl flex flex-col overflow-hidden">
        <DrawerHeader className="shrink-0 flex flex-row items-center justify-between gap-3 border-b py-4">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground shrink-0" />
            <DrawerTitle className="text-left line-clamp-2">
              Notification Details
            </DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 bg-transparent! border-none! hover:bg-transparent! hover:text-muted-foreground!"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {notification ? (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="shrink-0 px-4 py-3 space-y-3 border-b">
              <p className="font-semibold text-foreground text-sm leading-snug">
                {notification.message ?? "—"}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                {notification.notificationCode && (
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {notification.notificationCode}
                  </span>
                )}
                <Badge
                  variant={statusStyle ? undefined : "secondary"}
                  className="border text-xs capitalize font-medium px-2 py-0 rounded-full"
                  style={statusStyle}
                >
                  {statusText}
                </Badge>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 overscroll-contain">
              <div className="space-y-6 pb-6">
                {/* Target Entity Section */}
                <section className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Entity
                  </h4>
                  <div className="rounded-lg border bg-card/50 p-3 text-sm space-y-2">
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">
                        {notification.targetEntityType ?? "—"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* User Section */}
                {notification.user && (
                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Associated User
                    </h4>
                    <div className="rounded-lg border bg-card/50 p-3 text-sm space-y-2">
                      <div className="flex justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">
                          {notification.user.firstName}{" "}
                          {notification.user.lastName}
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {/* Action Section */}
                {showActionsSection && (
                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Actions
                    </h4>
                    <div className="rounded-lg border bg-card/50 p-3 text-sm flex flex-col gap-2">
                      {hasComplaintLink && (
                        <Button
                          type="button"
                          className="w-full text-xs"
                          onClick={handleNavigateToComplaint}
                        >
                          View Complaint
                        </Button>
                      )}

                      {!isRead && onMarkAsRead && (
                        <Button
                          type="button"
                          className="w-full text-xs"
                          onClick={() => onMarkAsRead(notification)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1 text-white!" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </section>
                )}

                {/* Timeline Section */}
                <section className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Timeline
                  </h4>
                  <div className="rounded-lg border bg-card/50 p-3 text-sm space-y-2">
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Received</span>
                      <span className="font-medium">
                        {notification.createdAt
                          ? formatDate(String(notification.createdAt))
                          : "—"}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No notification selected.
            </p>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default NotificationDetailsDrawer;
