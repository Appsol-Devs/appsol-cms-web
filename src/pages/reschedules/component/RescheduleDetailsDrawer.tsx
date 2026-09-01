import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/helpers";
import { getLookupBadgeStyle, getPaymentStatusColor } from "@/lib/enums";
import type { IReschedule } from "../common/reschedules";
import { CalendarClock, CheckCircle2, X, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { showToast } from "@/components/ui/CustomToast";
import { useUpdateRescheduleMutation } from "../common/reschedulesApi";

export interface RescheduleDetailsDrawerProps {
  reschedule: IReschedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RescheduleDetailsDrawer({
  reschedule,
  open,
  onOpenChange,
}: RescheduleDetailsDrawerProps) {
  const navigate = useNavigate();
  const [updateReschedule, { isLoading: isUpdating }] =
    useUpdateRescheduleMutation();

  const status = reschedule?.status ?? "pending";
  const statusColor = getPaymentStatusColor(status);

  const customer = reschedule?.customer as any;
  const customerName =
    typeof customer === "string" ? customer : (customer?.name ?? "N/A");
  const customerCompany =
    typeof customer === "string" ? "" : (customer?.companyName ?? "");

  const handleView = () => {
    if (!reschedule?.id) return;
    onOpenChange(false);
    navigate(allRoutes.PORTAL + allRoutes.VIEW_RESCHEDULE(reschedule.id), {
      state: { initialData: reschedule },
    });
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] sm:max-w-lg !top-4 !right-4 !bottom-4 data-[vaul-drawer-direction=right]:!top-4 data-[vaul-drawer-direction=right]:!right-4 data-[vaul-drawer-direction=right]:!bottom-4 data-[vaul-drawer-direction=right]:rounded-xl flex flex-col overflow-hidden">
        <DrawerHeader className="flex flex-row items-center justify-between gap-3 border-b py-4">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-muted-foreground shrink-0" />
            <DrawerTitle>Schedule Preview</DrawerTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {reschedule?.id && (
              <Button
                variant="default"
                size="sm"
                className="bg-primary! text-primary-foreground! rounded-md! text-xs! hover:opacity-90! hover:bg-primary/90!"
                onClick={handleView}
              >
                View Full Details
              </Button>
            )}
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 bg-transparent! border-none! hover:bg-transparent! hover:text-muted-foreground!"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {reschedule ? (
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 py-3 space-y-4">
              <div className="space-y-3 border-b pb-3">
                <p className="font-semibold text-foreground">
                  {reschedule.rescheduleCode ?? "—"} {reschedule.title ?? ""}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={statusColor ? undefined : "secondary"}
                      className="capitalize text-xs"
                      style={getLookupBadgeStyle(statusColor)}
                    >
                      {status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2" />
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Customer
                    </span>
                    <span className="text-sm font-medium">{customerName}</span>
                    {customerCompany && (
                      <span className="text-xs text-muted-foreground">
                        {customerCompany}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Entity
                    </span>
                    <span className="text-sm font-medium">
                      {reschedule.targetEntityType ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  Schedule
                </h4>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Original Date &amp; Time
                  </span>
                  <span className="text-sm font-medium">
                    {reschedule.originalDateTime
                      ? formatDateTime(reschedule.originalDateTime)
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    New Date &amp; Time
                  </span>
                  <span className="text-sm font-medium">
                    {reschedule.newDateTime
                      ? formatDateTime(reschedule.newDateTime)
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">From</span>
                  <span className="text-sm font-medium">
                    {reschedule.from ? formatDateTime(reschedule.from) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">To</span>
                  <span className="text-sm font-medium">
                    {reschedule.to ? formatDateTime(reschedule.to) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Reason</span>
                  <span className="text-sm">{reschedule.reason ?? "—"}</span>
                </div>

                {status === "pending" && (
                  <div className="pt-2 space-y-2">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                      Approval Workflow
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <ConfirmationDialog
                        alertType="update"
                        title="Approve Schedule?"
                        rightActionTitle="Approve"
                        content={
                          <p className="text-muted-foreground text-center">
                            Are you sure you want to <strong>approve</strong>{" "}
                            this schedule{" "}
                            <strong>
                              {reschedule.rescheduleCode ?? reschedule.title}
                            </strong>
                            ?
                          </p>
                        }
                        onConfirmClicked={async () => {
                          if (!reschedule?.id) return;
                          try {
                            await updateReschedule({
                              id: reschedule.id,
                              status: "approved",
                            }).unwrap();
                            showToast({
                              title: "Success",
                              message: "Schedule approved.",
                              type: "success",
                            });
                            onOpenChange(false);
                          } catch {
                            showToast({
                              title: "Error",
                              message: "Failed to approve schedule.",
                              type: "error",
                            });
                          }
                        }}
                        trigger={
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs bg-primary! text-primary-foreground!"
                            disabled={isUpdating}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        }
                      />
                      <ConfirmationDialog
                        alertType="delete"
                        title="Reject Schedule?"
                        rightActionTitle="Reject"
                        content={
                          <p className="text-muted-foreground text-center">
                            Are you sure you want to <strong>reject</strong>{" "}
                            this schedule{" "}
                            <strong>
                              {reschedule.rescheduleCode ?? reschedule.title}
                            </strong>
                            ?
                          </p>
                        }
                        onConfirmClicked={async () => {
                          if (!reschedule?.id) return;
                          try {
                            await updateReschedule({
                              id: reschedule.id,
                              status: "rejected",
                            }).unwrap();
                            showToast({
                              title: "Success",
                              message: "Schedule rejected.",
                              type: "success",
                            });
                            onOpenChange(false);
                          } catch {
                            showToast({
                              title: "Error",
                              message: "Failed to reject schedule.",
                              type: "error",
                            });
                          }
                        }}
                        trigger={
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs bg-red-700! text-white hover:bg-red-800"
                            disabled={isUpdating}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Select a schedule to preview.
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
