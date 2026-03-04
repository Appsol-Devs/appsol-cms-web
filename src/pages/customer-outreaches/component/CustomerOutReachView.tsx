import ActionButton from "@/components/ActionButtons";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/CustomToast";
import DetailItem from "@/components/ui/DetailItem";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  PhoneOutgoing,
  Trash2,
  User,
  UserCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import type { ICustomerOutreach } from "../common/customer-outreach";
import { useDeleteCustomerOutReachMutation, useLazyGetCustomerOutReachQuery } from "../common/customerOutreachApi";
import { formatDate } from "@/lib/helpers";

const CustomerOutReachView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (location.state as { initialData?: ICustomerOutreach } | null)?.initialData;

  const [deleteOutreach] = useDeleteCustomerOutReachMutation();
  const [getOutreachDetails, { isLoading: isFetching }] = useLazyGetCustomerOutReachQuery();

  const [selectedOutreach, setSelectedOutreach] = useState<ICustomerOutreach | null>(() =>
    initialData && initialData._id === id ? initialData : null
  );

  useEffect(() => {
    if (id) {
      getOutreachDetails(id)
        .unwrap()
        .then((res) => {
          if (res) {
            setSelectedOutreach(res);
          }
        })
        .catch((err) => console.error("Failed to fetch outreach details", err));
    }
  }, [id, getOutreachDetails]);

  const handleDeletion = async (outreachId: string) => {
    if (!outreachId) return;

    try {
      await deleteOutreach({ id: outreachId }).unwrap();
      showToast({
        title: "Success",
        message: "Outreach log deleted successfully.",
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete outreach", error);
      showToast({
        title: "Error",
        message: "Failed to delete outreach log",
        type: "error",
      });
    }
  };

  if (!selectedOutreach) {
    if (isFetching) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Outreach not found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Outreach Details" />

      <PageSummary
        icon={PhoneOutgoing}
        title={selectedOutreach.purpose}
        description={`Logged on ${formatDate(selectedOutreach.createdAt)}`}
        actionComponent={
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={() =>
                navigate(
                  allRoutes.PORTAL +
                  allRoutes.UPDATE_CUSTOMER_OUTREACH(id as string)
                )
              }
              type="edit"
              useText="Edit Log"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Outreach Log?"
              rightActionTitle="Delete"
              content={
                <p className="text-gray-500 text-center">
                  This action cannot be undone. This will permanently delete this
                  interaction log with <strong>{selectedOutreach.customer?.name ?? "this customer"}</strong>.
                </p>
              }
              onConfirmClicked={() => handleDeletion(id as string)}
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
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm"
              style={{
                backgroundColor: selectedOutreach.callStatus?.colorCode
                  ? `${selectedOutreach.callStatus.colorCode}20`
                  : "#eff6ff",
              }}
            >
              <PhoneOutgoing
                className="w-10 h-10"
                style={{
                  color: selectedOutreach.callStatus?.colorCode ?? "#2563eb",
                }}
              />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {selectedOutreach.customer?.name ?? "—"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">Customer</p>

            <div className="flex flex-wrap justify-center gap-2 w-full">
              <Badge
                variant="outline"
                className="px-3 py-1 bg-white"
                style={{
                  borderColor: selectedOutreach.outreachType?.colorCode,
                  color: selectedOutreach.outreachType?.colorCode
                }}
              >
                {selectedOutreach.outreachType?.name ?? "—"}
              </Badge>

              <Badge
                variant="secondary"
                style={{
                  backgroundColor: selectedOutreach.callStatus?.colorCode ?? "#e5e7eb",
                  color: "#fff"
                }}
              >
                {selectedOutreach.callStatus?.name ?? "—"}
              </Badge>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Info</h3>
            </div>
            <div className="p-5 space-y-4">
              <DetailItem
                label="Logged By"
                value={
                  selectedOutreach.loggedBy && typeof selectedOutreach.loggedBy === "object"
                    ? `${selectedOutreach.loggedBy.firstName ?? ""} ${selectedOutreach.loggedBy.lastName ?? ""}`.trim() || "—"
                    : "—"
                }
                icon={<UserCircle className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem
                label="Routine Call"
                value={selectedOutreach.isRoutineCall ? "Yes" : "No"}
                icon={<CheckCircle2 className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem
                label="Created At"
                value={formatDate(selectedOutreach.createdAt)}
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Interaction Log</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem label="Purpose" value={selectedOutreach.purpose} />
                <DetailItem label="Outreach Code" value={selectedOutreach.outreachCode || "N/A"} />
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">
                  Notes
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedOutreach.notes || "No notes recorded for this interaction."}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Customer Contact</h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem
                label="Full Name"
                value={selectedOutreach.customer?.name ?? "—"}
              />
              <DetailItem
                label="Email Address"
                value={selectedOutreach.customer?.email ?? "—"}
                icon={<Mail className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem
                label="Phone Number"
                value={selectedOutreach.customer?.phone ?? "—"}
                icon={<Phone className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerOutReachView;