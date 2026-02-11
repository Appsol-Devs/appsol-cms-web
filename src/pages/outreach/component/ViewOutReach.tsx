import ActionButton from "@/components/ActionButtons";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/CustomToast";
import DetailItem from "@/components/ui/DetailItem";
import StatusBadge from "@/components/ui/StatusBadge";
import type { IOutReachType } from "@/pages/customer/common/customers";
import { allRoutes } from "@/utils/routes";
import {
  Megaphone,
  Palette,
  Tag,
  Target,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteOutReachTypeMutation, useLazyGetOutReachTypeQuery } from "../common/OutReachApi";


const ViewOutReach = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleteOutReach] = useDeleteOutReachTypeMutation();
  const [getOutReachDetails, { isLoading: isFetching }] =
      useLazyGetOutReachTypeQuery();
  
  const [selectedOutReach, setSelectedOutReach] = useState<IOutReachType | null>(
    null
  );

  useEffect(() => {
    if (id) {
      getOutReachDetails(id)
        .unwrap()
        .then((res) => {
          if (res) {
            setSelectedOutReach(res);
          }
        })
        .catch((err) => console.error("Failed to fetch outreach type", err));
    }
  }, [id, getOutReachDetails]);

  const handleDeletion = async (typeId: string) => {
    if (!typeId) return;

    try {
      await deleteOutReach({ id: typeId }).unwrap();
      showToast({
        title: "Success",
        message: "Outreach Type deleted successfully.",
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete outreach type", error);
      showToast({
        title: "Error",
        message: "Failed to delete outreach type",
        type: "error",
      });
    }
  };

  if (isFetching || !selectedOutReach) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading outreach details...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Outreach Configuration" />

      <PageSummary
        icon={Target}
        title={`${selectedOutReach.name}`}
        description="Manage outreach type details and configuration"
        actionComponent={
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={() =>
                navigate(
                  allRoutes.PORTAL +
                    allRoutes.UPDATE_OUTREACH_TYPE(id as string)
                )
              }
              type="edit"
              useText="Edit Type"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Outreach Type?"
              rightActionTitle="Delete"
              content={
                <p className="text-gray-500 text-center">
                  This action cannot be undone. This will permanently delete the
                  outreach type <strong>{selectedOutReach.name}</strong>.
                </p>
              }
              onConfirmClicked={() => handleDeletion(id as string)}
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
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm"
              style={{
                backgroundColor: selectedOutReach.colorCode
                  ? `${selectedOutReach.colorCode}20` 
                  : "#eff6ff",
              }}
            >
              <Megaphone
                className="w-10 h-10"
                style={{
                  color: selectedOutReach.colorCode || "#2563eb",
                }}
              />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {selectedOutReach.name}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {selectedOutReach.outreachTypeCode}
              </span>
            </div>

            <div className="w-full border-t border-gray-100 pt-4 mt-2">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-500">Status</span>
                <StatusBadge active={selectedOutReach.isActive} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem label="Name" value={selectedOutReach.name} />
              <DetailItem
                label="Type Code"
                value={selectedOutReach.outreachTypeCode}
                icon={<Tag className="w-4 h-4" />}
              />

              <div className="md:col-span-2">
                <DetailItem
                  label="Description"
                  value={selectedOutReach.description || "No description provided."}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">
                Configuration & Metadata
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Color Identifier
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    style={{
                      backgroundColor: selectedOutReach.colorCode || "#e5e7eb",
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedOutReach.colorCode || "N/A"}
                  </span>
                </div>
              </div>

             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOutReach;