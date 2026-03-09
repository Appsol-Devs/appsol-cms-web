import ActionButton from "@/components/ActionButtons";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import DetailItem from "@/components/ui/DetailItem";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/CustomToast";
import { formatDate } from "@/lib/helpers";
import { allRoutes } from "@/utils/routes";
import {
  Calendar,
  FileText,
  Ticket,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ITicket } from "../common/tickets";
import {
  useLazyGetATicketQuery,
  useDeleteTicketMutation,
} from "../common/ticketsApi";
import { useLazyGetAUserQuery } from "@/pages/users/common/usersApi";
import { Badge } from "@/components/ui/badge";
import {
  getTicketPriorityColor,
  getTicketStatusColor,
  getLookupBadgeStyle,
} from "@/lib/enums";

const TicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (location.state as { initialData?: ITicket } | null)?.initialData;

  const [getTicketDetails, { isLoading: isFetching }] =
    useLazyGetATicketQuery();
  const [deleteTicket] = useDeleteTicketMutation();
  const [getAUser] = useLazyGetAUserQuery();
  const [loggedByName, setLoggedByName] = useState<string>("—");
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(
    () => (initialData && initialData._id === id ? initialData : null),
  );

  useEffect(() => {
    if (!id) return;

    getTicketDetails(id)
      .unwrap()
      .then((res) => {
        if (res) setSelectedTicket(res);
      })
      .catch((err) => console.error("Failed to fetch ticket details", err));
  }, [id, getTicketDetails]);

  useEffect(() => {
    const loggedBy = selectedTicket?.loggedBy;
    if (!loggedBy) {
      setLoggedByName("—");
      return;
    }
    if (typeof loggedBy === "object") {
      const user = loggedBy as { firstName?: string; lastName?: string };
      setLoggedByName(
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"
      );
      return;
    }
    getAUser(loggedBy as string)
      .unwrap()
      .then((user) => {
        setLoggedByName(
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"
        );
      })
      .catch(() => setLoggedByName("—"));
  }, [selectedTicket, getAUser]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteTicket({ id }).unwrap();
      showToast({
        title: "Success",
        message: "Ticket deleted successfully.",
        type: "success",
      });
      navigate(allRoutes.PORTAL + allRoutes.TICKETS);
    } catch (error) {
      console.error("Failed to delete ticket", error);
      showToast({
        title: "Error",
        message: "Failed to delete ticket.",
        type: "error",
      });
    }
  };

  if (!selectedTicket) {
    if (isFetching) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Ticket not found.
      </div>
    );
  }

  const priorityColor = getTicketPriorityColor(selectedTicket.priority ?? "");
  const statusColor = getTicketStatusColor(selectedTicket.status ?? "");

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Ticket Details" />

      <PageSummary
        icon={Ticket}
        title={selectedTicket.ticketCode ?? "Ticket"}
        description={selectedTicket.title ?? ""}
        actionComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton
              onClick={() => {
                const complaintId = selectedTicket.complaintId ?? selectedTicket.complaint?._id;
                if (complaintId) {
                  navigate(allRoutes.PORTAL + allRoutes.VIEW_COMPLAINT(complaintId), {
                    state: { initialData: selectedTicket.complaint },
                  });
                } else {
                  navigate(allRoutes.PORTAL + allRoutes.COMPLAINTS);
                }
              }}
              type="view"
              useText="View Complaint"
            />
            <ActionButton
              onClick={() =>
                navigate(
                  allRoutes.PORTAL + allRoutes.UPDATE_TICKET(id as string),
                )
              }
              type="edit"
              useText="Edit"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Ticket?"
              rightActionTitle="Delete"
              content={
                <p className="text-muted-foreground text-center">
                  This action cannot be undone. This will permanently delete the
                  ticket{" "}
                  <strong>
                    {selectedTicket.ticketCode ?? selectedTicket.title}
                  </strong>
                  .
                </p>
              }
              onConfirmClicked={handleDelete}
              trigger={
                <Button
                  variant="destructive"
                  className="bg-red-700! text-white hover:bg-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="text-xs">Delete</span>
                </Button>
              }
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Ticket className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">
              {selectedTicket.complaint?.customer?.name ?? "—"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedTicket.complaint?.customer?.companyName ?? "—"}
            </p>
            <div className="w-full mt-3 pt-3 border-t space-y-2 flex flex-wrap justify-center gap-2">
              <Badge
                variant={priorityColor ? undefined : "secondary"}
                className="capitalize"
                style={getLookupBadgeStyle(priorityColor)}
              >
                {selectedTicket.priority ?? "—"}
              </Badge>
              <Badge
                variant={statusColor ? undefined : "secondary"}
                className="capitalize"
                style={getLookupBadgeStyle(statusColor)}
              >
                {selectedTicket.status ?? "—"}
              </Badge>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assignment
            </h3>
            <DetailItem
              label="Assigned Engineer"
              value={
                selectedTicket.assignedEngineer
                  ? `${selectedTicket.assignedEngineer.firstName ?? ""} ${selectedTicket.assignedEngineer.lastName ?? ""}`.trim()
                  : "Unassigned"
              }
              icon={<Wrench className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Requested Date"
              value={formatDate(selectedTicket.requestedDate)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Info
            </h3>
            <DetailItem
              label="Logged By"
              value={loggedByName}
              icon={<User className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Created At"
              value={formatDate(selectedTicket.createdAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden space-y-0">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-card-foreground">
                Ticket & Complaint Details
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                  Title
                </p>
                <p className="text-sm text-card-foreground">
                  {selectedTicket.title ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                  Complaint Code
                </p>
                <p className="text-sm text-card-foreground">
                  {selectedTicket.complaint?.complaintCode ?? "—"}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">
                  Complaint Description
                </label>
                <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.complaint?.description ??
                    "No description available."}
                </div>
              </div>
              {selectedTicket.notes && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">
                    Notes
                  </label>
                  <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
