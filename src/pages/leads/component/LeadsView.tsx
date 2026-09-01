import ActionButton from "@/components/ActionButtons";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import DetailItem from "@/components/ui/DetailItem";
import { showToast } from "@/components/ui/CustomToast";
import { formatDate } from "@/lib/helpers";
import {
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import { mapLeadToCustomerPrefill, type ILead } from "../common/leads";
import {
  useConvertLeadMutation,
  useDeleteLeadMutation,
  useLazyGetALeadQuery,
} from "../common/leadsApi";
import { Badge } from "@/components/ui/badge";
import {
  getLeadPriorityColor,
  getLeadStatusColor,
  getLookupBadgeStyle,
} from "@/lib/enums";
import { Button } from "@/components/ui/button";

const LeadsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (location.state as { initialData?: ILead } | null)
    ?.initialData;

  const [deleteLead] = useDeleteLeadMutation();
  const [convertLead, { isLoading: isConverting }] = useConvertLeadMutation();
  const [getLeadDetails, { isLoading: isFetching }] = useLazyGetALeadQuery();
  const [selectedLead, setSelectedLead] = useState<ILead | null>(() =>
    initialData && initialData.id === id ? initialData : null,
  );

  useEffect(() => {
    if (id) {
      getLeadDetails(id)
        .unwrap()
        .then((res) => {
          if (res) {
            setSelectedLead(res);
          }
        })
        .catch((err) => console.error("Failed to fetch lead", err));
    }
  }, [id, getLeadDetails]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteLead({ id }).unwrap();
      showToast({
        title: "Success",
        message: "Lead deleted successfully.",
        type: "success",
      });
      navigate(allRoutes.PORTAL + allRoutes.LEADS);
    } catch (error) {
      console.error("Failed to delete lead", error);
      showToast({
        title: "Error",
        message: "Failed to delete lead",
        type: "error",
      });
    }
  };

  const handleConvert = async () => {
    if (!id || !selectedLead) return;
    try {
      const res = await convertLead(id).unwrap();
      let mergedLead = { ...selectedLead, ...res };

      try {
        const refreshed = await getLeadDetails(id).unwrap();
        if (refreshed) mergedLead = refreshed;
      } catch {
        // use convert response if refetch fails
      }

      setSelectedLead(mergedLead);

      const customerId = mergedLead.customerId ?? mergedLead.customer?.id;

      showToast({
        title: "Success",
        message: customerId
          ? "Lead converted. Opening customer record."
          : "Lead converted. Complete the customer profile.",
        type: "success",
      });

      if (customerId) {
        navigate(allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER(customerId), {
          state: { initialData: res.customer },
        });
        return;
      }

      navigate(allRoutes.PORTAL + allRoutes.ADD_CUSTOMER, {
        state: {
          customerData: mapLeadToCustomerPrefill(mergedLead),
          fromLeadId: id,
          leadAlreadyConverted: !!mergedLead.isConverted,
        },
      });
    } catch (error) {
      console.error("Failed to convert lead", error);
      showToast({
        title: "Error",
        message: "Failed to convert lead.",
        type: "error",
      });
    }
  };

  if (!selectedLead) {
    if (isFetching) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Lead not found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Leads Details" />

      <PageSummary
        icon={User}
        title={selectedLead.name ?? "Unknown"}
        description={`Lead from ${selectedLead.companyName ?? "Unknown company"}`}
        actionComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.UPDATE_LEAD(id as string))
              }
              type="edit"
              useText="Edit"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Lead?"
              rightActionTitle="Delete"
              content={
                <p className="text-muted-foreground text-center">
                  This action cannot be undone. This will permanently delete the
                  lead{" "}
                  <strong>
                    {selectedLead.name ?? selectedLead.companyName}
                  </strong>
                  .
                </p>
              }
              onConfirmClicked={handleDelete}
              trigger={
                <Button
                  variant="destructive"
                  className="bg-red-700! text-white"
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
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">
              {selectedLead.name ?? "—"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedLead.companyName ?? "—"}
            </p>
            {selectedLead.isConverted && (
              <Badge className="mb-4 bg-primary/90 text-primary-foreground hover:bg-primary/90">
                Converted to customer
              </Badge>
            )}
            <div className="w-full space-y-3 border-t pt-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Lead Status
                </p>
                {(() => {
                  const status = selectedLead.leadStatus ?? "";
                  const color = getLeadStatusColor(status);
                  return (
                    <Badge
                      variant={color ? undefined : "secondary"}
                      className="capitalize border"
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
                      {status || "—"}
                    </Badge>
                  );
                })()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Priority
                </p>
                {(() => {
                  const priority = selectedLead.priority ?? "";
                  const color = getLeadPriorityColor(priority);
                  return (
                    <Badge
                      variant={color ? undefined : "outline"}
                      className="capitalize border"
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

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Stage
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Current</p>
              <Badge
                variant={
                  selectedLead.leadStage?.colorCode ? undefined : "secondary"
                }
                className="capitalize border"
                style={getLookupBadgeStyle(selectedLead.leadStage?.colorCode)}
              >
                {selectedLead.leadStage?.name ?? "—"}
              </Badge>
              <p className="text-muted-foreground mt-2">Next Step</p>
              <Badge
                variant={
                  selectedLead.nextStep?.colorCode ? undefined : "secondary"
                }
                className="capitalize border"
                style={getLookupBadgeStyle(selectedLead.nextStep?.colorCode)}
              >
                {selectedLead.nextStep?.name ?? "—"}
              </Badge>
            </div>
          </div>

          {selectedLead.isConverted ? (
            <div className="space-y-2 w-full">
              <div className="w-full rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium text-card-foreground">
                    Converted
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    This lead has been converted to a customer.
                  </p>
                </div>
              </div>
              {selectedLead.customerId && (
                <Button
                  className="w-full bg-primary! text-primary-foreground text-xs"
                  onClick={() =>
                    navigate(
                      allRoutes.PORTAL +
                        allRoutes.VIEW_CUSTOMER(selectedLead.customerId!),
                    )
                  }
                >
                  View Customer
                </Button>
              )}
            </div>
          ) : (
            <ConfirmationDialog
              alertType="update"
              title="Convert Lead?"
              rightActionTitle="Yes, Convert"
              content={
                <p className="text-muted-foreground text-center">
                  This will convert{" "}
                  <strong>
                    {selectedLead.name ?? selectedLead.companyName}
                  </strong>{" "}
                  . You won't be able to change its status afterwards.
                </p>
              }
              onConfirmClicked={handleConvert}
              disabled={isConverting}
              trigger={
                <Button
                  disabled={isConverting}
                  className="w-full bg-primary! text-xs rounded-md text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs ml-1">Convert</span>
                </Button>
              }
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h3 className="font-semibold text-card-foreground">
                Contact & Business Details
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={selectedLead.email}
              />
              <DetailItem
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={selectedLead.phone}
              />
              <DetailItem
                icon={<Briefcase className="w-4 h-4" />}
                label="Company Name"
                value={selectedLead.companyName}
              />
              <DetailItem
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={selectedLead.location}
              />
              <DetailItem label="Lead Source" value={selectedLead.leadSource} />
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <DetailItem label="Notes" value={selectedLead.notes} />
              </div>
              <div className="md:col-span-2 border-t border-border my-2" />
              <DetailItem
                icon={<span className="text-muted-foreground">📅</span>}
                label="Created"
                value={formatDate(selectedLead.createdAt)}
              />
              <DetailItem
                icon={<span className="text-muted-foreground">📅</span>}
                label="Last Updated"
                value={formatDate(selectedLead.updatedAt)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsView;
