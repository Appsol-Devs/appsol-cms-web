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
  Headset,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { IComplaint } from "../common/complaints";
import {
  useDeleteComplaintMutation,
  useLazyGetAComplaintQuery,
} from "../common/complaintsApi";
import { Badge } from "@/components/ui/badge";
import { getComplaintStatusColor, getLookupBadgeStyle } from "@/lib/enums";

const ComplaintsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (location.state as { initialData?: IComplaint } | null)?.initialData;

  const [deleteComplaint] = useDeleteComplaintMutation();
  const [getComplaintDetails, { isLoading: isFetching }] =
    useLazyGetAComplaintQuery();

  const [selectedComplaint, setSelectedComplaint] = useState<IComplaint | null>(
    () => (initialData && initialData._id === id ? initialData : null),
  );

  useEffect(() => {
    if (!id) return;

    getComplaintDetails(id)
      .unwrap()
      .then((res) => {
        if (res) {
          setSelectedComplaint(res);
        }
      })
      .catch((err) => console.error("Failed to fetch complaint details", err));
  }, [id, getComplaintDetails]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteComplaint({ id }).unwrap();
      showToast({
        title: "Success",
        message: "Complaint deleted successfully.",
        type: "success",
      });
      navigate(allRoutes.PORTAL + allRoutes.COMPLAINTS);
    } catch (error) {
      console.error("Failed to delete complaint", error);
      showToast({
        title: "Error",
        message: "Failed to delete complaint.",
        type: "error",
      });
    }
  };

  if (!selectedComplaint) {
    if (isFetching) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Complaint not found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Complaint Details" />

      <PageSummary
        icon={Headset}
        title={selectedComplaint.complaintCode ?? "Complaint"}
        description={`Complaint from ${
          selectedComplaint.customer?.name ?? "Unknown customer"
        }`}
        actionComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton
              onClick={() =>
                navigate(
                  allRoutes.PORTAL +
                    allRoutes.UPDATE_COMPLAINT(id as string),
                )
              }
              type="edit"
              useText="Edit"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Complaint?"
              rightActionTitle="Delete"
              content={
                <p className="text-muted-foreground text-center">
                  This action cannot be undone. This will permanently delete the
                  complaint{" "}
                  <strong>
                    {selectedComplaint.complaintCode ??
                      selectedComplaint.customer?.name}
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
              <Headset className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">
              {selectedComplaint.customer?.name ?? "—"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedComplaint.customer?.phone ?? "—"}
            </p>
            <div className="w-full mt-3 pt-3 border-t space-y-1 text-left">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                Company
              </p>
              <p className="text-sm text-card-foreground font-medium">
                {selectedComplaint.customer?.companyName ?? "—"}
              </p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Info
            </h3>
            <DetailItem
              label="Logged By"
              value={
                selectedComplaint.loggedBy
                  ? `${selectedComplaint.loggedBy.firstName} ${selectedComplaint.loggedBy.lastName}`
                  : "—"
              }
              icon={<User className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Created At"
              value={formatDate(selectedComplaint.createdAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Last Updated"
              value={formatDate(selectedComplaint.updatedAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden space-y-0">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-card-foreground">
                Complaint Description
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                  Complaint Code
                </p>
                <p className="text-sm text-card-foreground">
                  {selectedComplaint.complaintCode ?? "—"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Complaint Type
                  </p>
                  <Badge
                    variant={
                      selectedComplaint.complaintType?.colorCode
                        ? undefined
                        : "secondary"
                    }
                    className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                    style={getLookupBadgeStyle(
                      selectedComplaint.complaintType?.colorCode
                    )}
                  >
                    {selectedComplaint.complaintType?.name ?? "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Category
                  </p>
                  <Badge
                    variant={
                      selectedComplaint.complaintCategory?.colorCode
                        ? undefined
                        : "secondary"
                    }
                    className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                    style={getLookupBadgeStyle(
                      selectedComplaint.complaintCategory?.colorCode
                    )}
                  >
                    {selectedComplaint.complaintCategory?.name ?? "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Related Software
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedComplaint.relatedSoftware?.name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Status
                  </p>
                  <Badge
                    variant={
                      getComplaintStatusColor(selectedComplaint.status ?? "")
                        ? undefined
                        : "secondary"
                    }
                    className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                    style={getLookupBadgeStyle(
                      getComplaintStatusColor(selectedComplaint.status ?? "")
                    )}
                  >
                    {selectedComplaint.status ?? "—"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">
                  Description
                </label>
                <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description ||
                    "No description has been provided for this complaint."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsView;
