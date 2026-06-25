import { formatDateTime } from "@/lib/helpers";
import {
  CircleDot,
  Ticket,
  User,
  Wrench,
  Calendar,
  AlertCircle,
} from "lucide-react";
import ActionButton from "@/components/ActionButtons";
import CustomerCompanyCell from "@/components/CustomerCompanyCell";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ITicket } from "../common/tickets";
import { useLazyGetTicketsQuery, useLazyGetATicketQuery } from "../common/ticketsApi";
import TicketPreviewDrawer from "./TicketPreviewDrawer";
import {
  getTicketPriorityColor,
  getTicketStatusColor,
  getLookupBadgeStyle,
} from "@/lib/enums";

const TicketCustomerCell = ({ ticket }: { ticket: ITicket }) => (
  <CustomerCompanyCell customer={ticket.complaint?.customer} />
);

const Tickets = () => {
  const [fetchQuery, fetchState] = useLazyGetTicketsQuery();
  const [getATicket] = useLazyGetATicketQuery();
  const [executed, setExecuted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<ITicket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ITicket>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Ticket",
        accessorKey: "ticketCode",
        meta: { icon: <Ticket size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.ticketCode ?? "N/A"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.title ?? "—"}
            </span>
          </div>
        ),
      },
      {
        header: "Customer",
        accessorKey: "complaint.customer",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => <TicketCustomerCell ticket={row.original} />,
      },
      {
        header: "Assigned Engineer",
        accessorKey: "assignedEngineer",
        meta: { icon: <Wrench size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.assignedEngineer
                ? `${row.original.assignedEngineer.firstName ?? ""} ${row.original.assignedEngineer.lastName ?? ""}`.trim()
                : "Unassigned"}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.assignedEngineer?.email ?? ""}
            </span>
          </div>
        ),
      },
      {
        header: "Requested Date",
        accessorKey: "requestedDate",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original?.requestedDate
              ? formatDateTime(row.original.requestedDate)
              : "—"}
          </span>
        ),
      },
      {
        header: "Priority",
        accessorKey: "priority",
        meta: { icon: <AlertCircle size={14} /> },
        cell: ({ row }) => {
          const priority = row.original?.priority ?? "";
          const color = getTicketPriorityColor(priority);
          const style = getLookupBadgeStyle(color);
          return (
            <Badge
              variant={color ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {priority || "N/A"}
            </Badge>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original?.status ?? "";
          const color = getTicketStatusColor(status);
          const style = getLookupBadgeStyle(color);
          return (
            <Badge
              variant={color ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={style}
            >
              {status || "N/A"}
            </Badge>
          );
        },
      },
    ],
    [executed],
  );

  return (
    <>
      <FeatureContentRenderer
        useDateFilters
        dateFilterNoDefault
        tableAddComponent={() => (
          <ActionButton
            type="add"
            useText="Add Ticket"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.ADD_TICKET)
            }
          />
        )}
        columns={columns}
        pathOnRowSelected={(row) => {
          const ticket = row as ITicket;
          setPreviewTicket(ticket);
          setDrawerOpen(true);
          const id = ticket._id;
          if (id) {
            getATicket(id)
              .unwrap()
              .then((full) => {
                if (full) setPreviewTicket(full);
              })
              .catch(() => {});
          }
        }}
        refetchData={executed}
        title="Tickets"
        filters={[
          "ticketStatus",
          "ticketPriority",
          "assignedEngineerId",
        ]}
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
      <TicketPreviewDrawer
        ticket={previewTicket}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTicketUpdated={(updated) => {
          setPreviewTicket(updated);
          setExecuted(true);
        }}
      />
    </>
  );
};

export default Tickets;
