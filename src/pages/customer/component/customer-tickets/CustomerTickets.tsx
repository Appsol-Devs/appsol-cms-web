import { formatDateTime } from "@/lib/helpers";
import type { IBaseQueryParam } from "@/lib/api";
import {
  CircleDot,
  Ticket,
  User,
  Wrench,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useOutletContext, useParams } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import CustomerCompanyCell from "@/components/CustomerCompanyCell";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  getTicketPriorityColor,
  getTicketStatusColor,
  getLookupBadgeStyle,
} from "@/lib/enums";
import type { ITicket } from "@/pages/ticket/common/tickets";
import { useLazyGetCustomerTicketsQuery } from "../../common/customersApi";
import { useLazyGetATicketQuery } from "@/pages/ticket/common/ticketsApi";
import TicketPreviewDrawer from "@/pages/ticket/component/TicketPreviewDrawer";

const TicketCustomerCell = ({ ticket }: { ticket: ITicket }) => (
  <CustomerCompanyCell customer={ticket.complaint?.customer} />
);

const CustomerTickets = () => {
  const { id: routeCustomerId } = useParams<{ id: string }>();
  const { customerId: outletCustomerId } =
    useOutletContext<{ customerId?: string }>() ?? {};
  const location = useLocation();

  const customerId = useMemo(() => {
    if (routeCustomerId) return routeCustomerId;
    if (outletCustomerId) return outletCustomerId;
    return location.pathname.match(/\/customers\/([^/]+)/)?.[1];
  }, [routeCustomerId, outletCustomerId, location.pathname]);

  const [trigger, fetchState] = useLazyGetCustomerTicketsQuery();
  const [getATicket] = useLazyGetATicketQuery();
  const [executed, setExecuted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<ITicket | null>(null);

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const fetchQuery = useCallback(
    (params: IBaseQueryParam) =>
      trigger({
        ...params,
        customerId,
        filters: {
          ...params.filters,
          customerId,
        },
      }),
    [trigger, customerId],
  );

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

  if (!customerId) {
    return null;
  }

  return (
    <>
      <FeatureContentRenderer
        key={customerId}
        columns={columns}
        pathOnRowSelected={(row) => {
          const ticket = row as ITicket;
          setPreviewTicket(ticket);
          setDrawerOpen(true);
          const ticketId = ticket.id;
          if (ticketId) {
            getATicket(ticketId)
              .unwrap()
              .then((full) => {
                if (full) setPreviewTicket(full);
              })
              .catch(() => {});
          }
        }}
        refetchData={executed}
        title="Customer Tickets"
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

export default CustomerTickets;
