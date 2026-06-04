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
import { useCloseTicketMutation, useLazyGetATicketQuery } from "../common/ticketsApi";
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
    <div className="flex gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <History className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
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
   const [getTicket] = useLazyGetATicketQuery();

  const handleClose = async () => {
    if (!ticket?._id) return;
    try {
      const id = ticket._id;
      const closed = await closeTicket(id).unwrap();

      let latest: ITicket | null = closed ?? null;
      try {
        const fresh = await getTicket(id).unwrap();
        if (fresh) latest = fresh;
      } catch {
      }

      if (latest) {
        onTicketUpdated?.(latest);
        showToast({
          title: "Success",
          message: "Ticket closed successfully.",
          type: "success",
        });
        onOpenChange(false);
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
      <DrawerContent className="h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] sm:max-w-lg !top-4 !right-4 !bottom-4 data-[vaul-drawer-direction=right]:!top-4 data-[vaul-drawer-direction=right]:!right-4 data-[vaul-drawer-direction=right]:!bottom-4 data-[vaul-drawer-direction=right]:rounded-xl flex flex-col overflow-hidden p-0">
        <DrawerHeader className="shrink-0 flex flex-row items-center justify-between gap-3 space-y-0 border-b p-0 px-4 py-4 text-left">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Ticket className="h-5 w-5 shrink-0 text-muted-foreground" />
            <DrawerTitle className="text-left text-base">Ticket Preview</DrawerTitle>
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 bg-transparent! border-none! hover:bg-transparent! hover:text-muted-foreground!"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {ticket ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b">
              <div className="space-y-3 px-4 py-4">
                <p className="text-sm font-semibold leading-snug text-foreground">
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
                        <p className="text-center text-muted-foreground">
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
                          className="shrink-0 bg-primary! text-primary-foreground! rounded-md! text-xs! hover:opacity-90! hover:bg-primary/90!"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Closed
                        </Button>
                      }
                    />
                  )}
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 shrink-0" />
                    <span>
                      Assigned to{" "}
                      {ticket.assignedEngineer
                        ? formatUserName(ticket.assignedEngineer)
                        : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Requested {formatDate(ticket.requestedDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <h4 className="flex shrink-0 items-center gap-2 border-b px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <History className="h-4 w-4" />
                Activities
              </h4>
              <ScrollArea className="min-h-0 flex-1">
                <div className="px-4 pb-4">
                  {history.length > 0 ? (
                    <div className="divide-y divide-border">
                      {history.map((entry, index) => (
                        <ActivityItem
                          key={entry._id ?? index}
                          entry={entry}
                          firstAssignee={firstAssignee}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-sm text-muted-foreground">
                      No activity recorded yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Select a ticket to preview.
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default TicketPreviewDrawer;
