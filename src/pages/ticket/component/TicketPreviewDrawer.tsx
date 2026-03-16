import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/helpers";
import {
  getTicketPriorityColor,
  getTicketStatusColor,
  getLookupBadgeStyle,
} from "@/lib/enums";
import { allRoutes } from "@/utils/routes";
import { X, Wrench, Calendar, History, Ticket, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ITicket, ITicketHistoryEntry } from "../common/tickets";
import { useCloseTicketMutation } from "../common/ticketsApi";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { showToast } from "@/components/ui/CustomToast";

function formatUserName(
  user?: { firstName?: string; lastName?: string } | string | null
): string {
  if (!user) return "—";
  if (typeof user === "string") return user;
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";
}

function formatHistoryDescription(
  entry: ITicketHistoryEntry,
  firstAssignee?: { firstName?: string; lastName?: string } | null
): string {
  const from = entry.from;
  const to = entry.to;

  if (!from && !to) {
    const name = firstAssignee ? formatUserName(firstAssignee) : null;
    return name ? `Ticket created and assigned to ${name}` : "Ticket created";
  }
  if (!from && to) return `Assigned to ${formatUserName(to)}`;
  if (from && !to) return `Unassigned from ${formatUserName(from)}`;
  return `Reassigned from ${formatUserName(from)} to ${formatUserName(to)}`;
}

function ActivityItem({
  entry,
  firstAssignee,
}: {
  entry: ITicketHistoryEntry;
  firstAssignee?: { firstName?: string; lastName?: string } | null;
}) {
  const description = formatHistoryDescription(entry, firstAssignee);
  const reason = entry.reason;
  const date = (entry.date ?? entry.createdAt) ? formatDate(entry.date ?? entry.createdAt!) : "—";

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <History className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <p className="text-sm text-foreground font-medium">{description}</p>
        {reason && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Reason: {reason}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{date}</p>
      </div>
    </div>
  );
}

interface TicketPreviewDrawerProps {
  ticket: ITicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketUpdated?: (ticket: ITicket) => void;
}

const TicketPreviewDrawer = ({
  ticket,
  open,
  onOpenChange,
  onTicketUpdated,
}: TicketPreviewDrawerProps) => {
  const navigate = useNavigate();
  const [closeTicket, { isLoading: isClosing }] = useCloseTicketMutation();

  const handleClose = async () => {
    if (!ticket?._id) return;
    try {
      const updated = await closeTicket(ticket._id).unwrap();
      if (updated) {
        onTicketUpdated?.(updated);
        showToast({
          title: "Success",
          message: "Ticket closed successfully.",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Failed to close ticket", error);
      showToast({
        title: "Error",
        message: "Failed to close ticket.",
        type: "error",
      });
    }
  };

  const handleViewFullDetails = () => {
    if (ticket?._id) {
      onOpenChange(false);
      navigate(allRoutes.PORTAL + allRoutes.VIEW_TICKET(ticket._id), {
        state: { initialData: ticket },
      });
    }
  };

  const apiHistory = ticket?.history ?? [];
  const ticketCreatedEntry: ITicketHistoryEntry | null = ticket?.createdAt
    ? { from: null, to: null, date: ticket.createdAt }
    : null;
  const otherEntries = apiHistory.filter((e) => e.from != null || e.to != null);
  const history = ticketCreatedEntry
    ? [...otherEntries, ticketCreatedEntry]
    : apiHistory;
  const firstAssignee = ticket?.assignedEngineer;
  const priorityColor = ticket ? getTicketPriorityColor(ticket.priority ?? "") : undefined;
  const statusColor = ticket ? getTicketStatusColor(ticket.status ?? "") : undefined;

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[calc(100vh-2rem)] max-h-none sm:max-w-lg !top-4 !right-4 !bottom-4 data-[vaul-drawer-direction=right]:!top-4 data-[vaul-drawer-direction=right]:!right-4 data-[vaul-drawer-direction=right]:!bottom-4 data-[vaul-drawer-direction=right]:rounded-xl flex flex-col">
        <DrawerHeader className="flex flex-row items-center justify-between gap-3 border-b py-4">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-muted-foreground shrink-0" />
            <DrawerTitle>Ticket Preview</DrawerTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {ticket?._id && (
              <Button
                variant="default"
                size="sm"
                className="bg-primary! text-primary-foreground! rounded-md! text-xs! hover:opacity-90! hover:bg-primary/90!"
                onClick={handleViewFullDetails}
              >
                View Full Details
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 shrink-0 h-8 w-8 bg-transparent! border-none! hover:bg-transparent! hover:text-muted-foreground!">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {ticket ? (
          <>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="px-4 py-3 space-y-3 border-b shrink-0">
                <p className="font-semibold text-foreground">
                  {ticket.ticketCode ?? "—"} {ticket.title ?? ""}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={statusColor ? undefined : "secondary"}
                      className="capitalize text-xs"
                      style={getLookupBadgeStyle(statusColor)}
                    >
                      {ticket.status ?? "—"}
                    </Badge>
                    <Badge
                      variant={priorityColor ? undefined : "secondary"}
                      className="capitalize text-xs"
                      style={getLookupBadgeStyle(priorityColor)}
                    >
                      {ticket.priority ?? "—"}
                    </Badge>
                  </div>
                  {ticket.status?.toLowerCase() !== "closed" && (
                    <ConfirmationDialog
                      title="Mark as Closed?"
                      rightActionTitle="Close"
                      content={
                        <p className="text-muted-foreground text-center">
                          Are you sure you want to close this ticket{" "}
                          <strong>{ticket.ticketCode ?? ticket.title}</strong>?
                        </p>
                      }
                      onConfirmClicked={handleClose}
                      confirmButtonClassName="!bg-primary hover:!bg-primary/90 !text-primary-foreground"
                      trigger={
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isClosing}
                          className="bg-primary! text-primary-foreground! rounded-md! text-xs! hover:opacity-90! hover:bg-primary/90! shrink-0"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Closed
                        </Button>
                      }
                    />
                  )}
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wrench className="w-4 h-4 shrink-0" />
                    <span>
                      Assigned to{" "}
                      {ticket.assignedEngineer
                        ? formatUserName(ticket.assignedEngineer)
                        : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Requested {formatDate(ticket.requestedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col px-4 py-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Activities
                </h4>
                <ScrollArea className="flex-1 pr-2 -mr-2">
                  {history.length > 0 ? (
                    <div className="space-y-0">
                      {history.map((entry, index) => (
                        <ActivityItem
                          key={entry._id ?? index}
                          entry={entry}
                          firstAssignee={firstAssignee}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No activity recorded yet.
                    </p>
                  )}
                </ScrollArea>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Select a ticket to preview.
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default TicketPreviewDrawer;
