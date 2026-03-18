import ActionButton from "@/components/ActionButtons";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import DetailItem from "@/components/ui/DetailItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/CustomToast";
import { formatDate, formatDateTime } from "@/lib/helpers";
import { getLookupBadgeStyle, getPaymentStatusColor } from "@/lib/enums";
import { allRoutes } from "@/utils/routes";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  FileText,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { IReschedule, RescheduleStatus } from "../common/reschedules";
import {
  useDeleteRescheduleMutation,
  useLazyGetARescheduleQuery,
  useUpdateRescheduleMutation,
} from "../common/reschedulesApi";
import { useLazyGetAUserQuery } from "@/pages/users/common/usersApi";

const RescheduleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (location.state as { initialData?: IReschedule } | null)
    ?.initialData;

  const [getReschedule, { isLoading: isFetching }] =
    useLazyGetARescheduleQuery();
  const [updateReschedule, { isLoading: isUpdating }] =
    useUpdateRescheduleMutation();
  const [deleteReschedule, { isLoading: isDeleting }] =
    useDeleteRescheduleMutation();
  const [getAUser] = useLazyGetAUserQuery();

  const [loggedByName, setLoggedByName] = useState<string>("—");
  const [selected, setSelected] = useState<IReschedule | null>(() =>
    initialData && initialData._id === id ? initialData : null,
  );

  useEffect(() => {
    if (!id) return;
    getReschedule(id)
      .unwrap()
      .then((res) => {
        if (res) setSelected(res);
      })
      .catch(() => {});
  }, [id, getReschedule]);

  useEffect(() => {
    const loggedBy = selected?.loggedBy;
    if (!loggedBy) {
      setLoggedByName("—");
      return;
    }
    if (typeof loggedBy === "object") {
      const user = loggedBy as { firstName?: string; lastName?: string };
      setLoggedByName(
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—",
      );
      return;
    }
    getAUser(loggedBy as string)
      .unwrap()
      .then((user) => {
        setLoggedByName(
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—",
        );
      })
      .catch(() => setLoggedByName("—"));
  }, [selected, getAUser]);

  const status = (selected?.status ?? "pending") as RescheduleStatus;
  const statusColor = getPaymentStatusColor(status);

  const customer = selected?.customer as any;
  const customerName =
    typeof customer === "string" ? customer : (customer?.name ?? "—");

  const canMutate = !!id && !isUpdating && !isDeleting;

  const viewTargetPath = useMemo(() => {
    const type = selected?.targetEntityType;
    const targetId = selected?.targetEntityId;
    if (!type || !targetId) return null;
    switch (type) {
      case "Ticket":
        return allRoutes.VIEW_TICKET(targetId);
      case "CustomerComplaint":
        return allRoutes.VIEW_COMPLAINT(targetId);
      case "CustomerOutreach":
        return allRoutes.VIEW_CUSTOMER_OUTREACH(targetId);
      case "SubscriptionReminder":
        return allRoutes.VIEW_SUBSCRIPTION(targetId);
      default:
        return null;
    }
  }, [selected?.targetEntityType, selected?.targetEntityId]);

  const refresh = async () => {
    if (!id) return;
    try {
      const res = await getReschedule(id).unwrap();
      if (res) setSelected(res);
    } catch {
      // ignored
    }
  };

  const handleStatusChange = async (next: RescheduleStatus) => {
    if (!id) return;
    try {
      await updateReschedule({ _id: id, status: next }).unwrap();
      showToast({
        title: "Success",
        message: `Status updated to ${next}.`,
        type: "success",
      });
      await refresh();
    } catch {
      showToast({
        title: "Error",
        message: "Failed to update status.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteReschedule({ id }).unwrap();
      showToast({
        title: "Success",
        message: "Reschedule deleted successfully.",
        type: "success",
      });
      navigate(allRoutes.PORTAL + allRoutes.RESCHEDULES);
    } catch {
      showToast({
        title: "Error",
        message: "Failed to delete reschedule.",
        type: "error",
      });
    }
  };

  if (!selected) {
    if (isFetching) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Reschedule not found.
      </div>
    );
  }

  const isPending = status === "pending";

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Reschedule Details" />

      <PageSummary
        icon={CalendarClock}
        title={selected.rescheduleCode ?? "Reschedule"}
        description={selected.title ?? ""}
        actionComponent={
          <div className="flex items-center gap-2 flex-wrap">
            {viewTargetPath && (
              <ActionButton
                type="view"
                useText="View Target"
                onClick={() => {
                  navigate(allRoutes.PORTAL + viewTargetPath, {
                    state: { initialData: selected.targetEntity },
                  });
                }}
              />
            )}
            <ActionButton
              type="edit"
              useText="Edit"
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.UPDATE_RESCHEDULE(id as string), {
                  state: { initialData: selected },
                })
              }
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Reschedule?"
              rightActionTitle="Delete"
              content={
                <p className="text-muted-foreground text-center">
                  This action cannot be undone. This will permanently delete{" "}
                  <strong>{selected.rescheduleCode ?? selected.title}</strong>.
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
              <CalendarClock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">
              {customerName}
            </h2>

            <div className="w-full mt-3 pt-3 border-t space-y-2 flex flex-wrap justify-center gap-2">
              <Badge
                variant={statusColor ? undefined : "secondary"}
                className="capitalize"
                style={getLookupBadgeStyle(statusColor)}
              >
                {status}
              </Badge>
              {selected.colorCode ? (
                <Badge
                  variant="secondary"
                  className="capitalize border"
                  style={getLookupBadgeStyle(selected.colorCode)}
                >
                  {selected.colorCode}
                </Badge>
              ) : null}
            </div>
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
              value={formatDate(selected.createdAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Last Updated"
              value={formatDate(selected.updatedAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>

        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden space-y-0">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-card-foreground">
                Reschedule Details
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                  Title
                </p>
                <p className="text-sm text-card-foreground">{selected.title ?? "—"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Target Entity Type
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selected.targetEntityType ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Target Entity ID
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selected.targetEntityId ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Original Date & Time
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selected.originalDateTime
                      ? formatDateTime(selected.originalDateTime)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    New Date & Time
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selected.newDateTime ? formatDateTime(selected.newDateTime) : "—"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">
                  Reason
                </label>
                <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {selected.reason ?? "—"}
                </div>
              </div>

              {isPending && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Approval Workflow
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <ConfirmationDialog
                      alertType="update"
                      title="Approve Reschedule?"
                      rightActionTitle="Approve"
                      content={
                        <p className="text-muted-foreground text-center">
                          Are you sure you want to{" "}
                          <strong>approve</strong> this reschedule{" "}
                          <strong>
                            {selected.rescheduleCode ?? selected.title}
                          </strong>
                          ?
                        </p>
                      }
                      onConfirmClicked={() => handleStatusChange("approved")}
                      trigger={
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs! bg-primary! text-primary-foreground!"
                          disabled={!canMutate}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      }
                    />
                    <ConfirmationDialog
                      alertType="delete"
                      title="Reject Reschedule?"
                      rightActionTitle="Reject"
                      content={
                        <p className="text-muted-foreground text-center">
                          Are you sure you want to{" "}
                          <strong>reject</strong> this reschedule{" "}
                          <strong>
                            {selected.rescheduleCode ?? selected.title}
                          </strong>
                          ?
                        </p>
                      }
                      onConfirmClicked={() => handleStatusChange("rejected")}
                      trigger={
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs! bg-red-700! text-white hover:bg-red-800"
                          disabled={!canMutate}
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
        </div>
      </div>
    </div>
  );
};

export default RescheduleView;

