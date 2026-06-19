import ActionButton from "@/components/ActionButtons";
import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { formatDate } from "@/lib/helpers";
import { getLookupBadgeStyle } from "@/lib/enums";
import {
  FileText,
  Trash2,
  BookOpenText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/CustomToast";

import {
  useLazyGetACustomerSetupQuery,
  useDeleteCustomerSetupMutation,
} from "./customerSetupApi";
import type { ICustomerSetup } from "./customerSetup";
import type { IUser } from "@/pages/customer/common/customers";

const formatUserFullName = (user: unknown): string => {
  if (typeof user === "string") return user;

  const u = user as IUser;
  if (u.firstName || u.lastName) {
    return `${u.firstName || ""} ${u.lastName || ""}`.trim();
  }
  if ("email" in u && typeof u.email === "string") return u.email;

  return "—";
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high": return "#ef4444";
    case "medium": return "#f59e0b";
    case "low": return "#10b981";
    default: return undefined;
  }
};

const CustomerSetupView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (
    location.state as { initialData?: ICustomerSetup } | null
  )?.initialData;

  const [deleteCustomerSetup] = useDeleteCustomerSetupMutation();
  const [getCustomerSetupDetails, { isLoading: isFetching }] = useLazyGetACustomerSetupQuery();

  const [selectedSetup, setSelectedSetup] = useState<ICustomerSetup | null>(() =>
    initialData && initialData._id === id ? initialData : null,
  );

  useEffect(() => {
    if (id) {
      getCustomerSetupDetails(id)
        .unwrap()
        .then((res) => {
          if (res) {
            setSelectedSetup(res);
          }
        })
        .catch((err) => console.error("Failed to fetch customer setup", err));
    }
  }, [id, getCustomerSetupDetails]);

  const handleDeletion = async (setupId: string) => {
    if (!setupId) return;

    try {
      await deleteCustomerSetup({ id: setupId }).unwrap();
      showToast({
        title: "Success",
        message: "Customer Setup deleted successfully.",
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete customer setup", error);
      showToast({
        title: "Error",
        message: "Failed to delete customer setup",
        type: "error",
      });
    }
  };

  if (!selectedSetup) {
    if (isFetching) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Customer Setup not found.
      </div>
    );
  }

  const customerName =
    typeof selectedSetup.customer === "string"
      ? selectedSetup.customer || "—"
      : (selectedSetup.customer?.name ?? "—");

  const softwareName =
    typeof selectedSetup.software === "string"
      ? selectedSetup.software || "—"
      : (selectedSetup.software?.name ?? "—");

  const softwareColorCode =
    typeof selectedSetup.software === "string"
      ? undefined
      : selectedSetup.software?.colorCode;

  const generalStatusName = selectedSetup.status?.replace(/([a-z])([A-Z])/g, '$1 $2') || "—";
  
  const setupStatusName =
    typeof selectedSetup.setupStatus === "string"
      ? selectedSetup.setupStatus || "—"
      : (selectedSetup.setupStatus?.name ?? "—");

  const setupStatusColorCode =
    typeof selectedSetup.setupStatus === "string"
      ? undefined
      : selectedSetup.setupStatus?.colorCode;

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Customer Setup Details" />
      <PageSummary
        icon={BookOpenText}
        title={selectedSetup.title ?? "Untitled Setup"}
        description={`Status: ${generalStatusName} • Setup: ${setupStatusName}`}
        actionComponent={
          <div className="flex items-center gap-3 flex-wrap">
            <ActionButton
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.UPDATE_CUSTOMER_SETUP(String(id)))
              }
              type="edit"
              useText="Edit"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Customer Setup?"
              rightActionTitle="Delete"
              content={
                <p className="text-muted-foreground text-center">
                  This action cannot be undone. This will permanently delete the
                  setup <strong>{selectedSetup.title}</strong> and remove its data.
                </p>
              }
              onConfirmClicked={() => handleDeletion(id as string)}
              trigger={
                <Button variant="destructive" className="bg-red-700! text-white">
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
              <BookOpenText className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">
              Setup Overview
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedSetup.scheduledStart
                ? `Starts: ${formatDate(selectedSetup.scheduledStart)}`
                : "No start date scheduled"}
            </p>

            <div className="w-full space-y-4 border-t pt-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                  General Status
                </p>
                <Badge
                  variant="outline"
                  className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                >
                  {generalStatusName}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                  Setup Status
                </p>
                <Badge
                  variant={setupStatusColorCode ? undefined : "secondary"}
                  className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                  style={getLookupBadgeStyle(setupStatusColorCode)}
                >
                  {setupStatusName}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                  Priority
                </p>
                {(() => {
                  const priority = selectedSetup.priority ?? "";
                  const color = getPriorityColor(priority);
                  return (
                    <Badge
                      variant={color ? undefined : "outline"}
                      className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                      style={
                        color
                          ? {
                              color,
                              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                              borderColor: color,
                            }
                          : undefined
                      }
                    >
                      {priority || "—"}
                    </Badge>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden space-y-0">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-card-foreground">
                Setup Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Customer
                  </p>
                  <p className="text-sm text-card-foreground">
                    {customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Related Software
                  </p>
                  <Badge
                    variant={softwareColorCode ? undefined : "secondary"}
                    className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                    style={getLookupBadgeStyle(softwareColorCode)}
                  >
                    {softwareName}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Assigned Users
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSetup.assignedTo && selectedSetup.assignedTo.length > 0 ? (
                      selectedSetup.assignedTo.map((user, idx) => {
                        const name = formatUserFullName(user);
                        return (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs font-medium px-2 py-0 rounded-full bg-muted/30"
                          >
                            {name}
                          </Badge>
                        );
                      })
                    ) : (
                      <p className="text-sm text-card-foreground">Unassigned</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">
                  Description
                </label>
                <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedSetup.description || "No description provided."}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">
                  Notes
                </label>
                <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedSetup.notes || "No additional notes."}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Scheduled Start
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedSetup.scheduledStart
                      ? formatDate(selectedSetup.scheduledStart)
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Scheduled End
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedSetup.scheduledEnd
                      ? formatDate(selectedSetup.scheduledEnd)
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Actual Completion Date
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedSetup.actualCompletionDate
                      ? formatDate(selectedSetup.actualCompletionDate)
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Added to Calendar
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedSetup.addToCalendar ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSetupView;