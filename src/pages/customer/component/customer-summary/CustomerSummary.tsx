import ActionButton from "@/components/ActionButtons";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { Badge } from "@/components/ui/badge";
import DetailItem from "@/components/ui/DetailItem";
import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
  UserCircle,
  FileText,
  Globe,
  Trash2,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import type { ICustomer } from "../../common/customers";
import {
  useDeleteCustomerMutation,
  useLazyGetACustomerQuery,
  useUpdateCustomerMutation,
} from "../../common/customersApi";
import { formatDate } from "@/lib/helpers";
import FetchingError from "@/components/FetchingError";
import LoadingComponent from "@/components/LoadingComponent";
import { showToast } from "@/components/ui/CustomToast";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { allRoutes } from "@/utils/routes";
import { CustomSwitchComponent } from "@/components/CustomSwitchComponent";
import type { ICustomerFields } from "../core/CustomersForm";

const CustomerSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [getCustomerDetails, { isFetching, isLoading, isError, isSuccess }] =
    useLazyGetACustomerQuery();
  const [customerDetails, setCustomerDetails] = useState<ICustomer | null>(null);

  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const form = useForm<ICustomerFields>({
    defaultValues: { status: false as any },
  });
  const { control, setValue, watch } = form;

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const res = await getCustomerDetails(customerId).unwrap();
      if (res) {
        setCustomerDetails(res);
        // Map the API string into a boolean for the Switch component
        setValue("status", (res.status === "active") as any);
      }
    } catch (error) {
      console.error("Failed to fetch customer", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomerDetails(id);
    }
  }, [id]);

  const handleStatusToggle = async (newIsActive: boolean) => {
    if (!customerDetails || !id) return;

    const previousStatus = customerDetails.status;
    const newStatus = newIsActive ? "active" : "inactive";

    setCustomerDetails({ ...customerDetails, status: newStatus as any });

    try {
      await updateCustomer({ _id: id, status: newStatus }).unwrap();
      showToast({
        title: "Success",
        message: `Customer status updated to ${newStatus}`,
        type: "success",
      });
    } catch {
      // 3. Rollback UI on failure
      setCustomerDetails({ ...customerDetails, status: previousStatus });
      setValue("status", (previousStatus === "active") as any);
      showToast({
        title: "Error",
        message: "Failed to update customer status",
        type: "error",
      });
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "status" && type === "change") {
        handleStatusToggle(Boolean(value.status));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, customerDetails, id]);

  const handleNavigateToEdit = () => {
    if (!id) return;
    navigate(allRoutes.PORTAL + allRoutes.UPDATE_CUSTOMER(id), {
      state: { customerData: customerDetails },
    });
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!customerId) return;

    try {
      await deleteCustomer({ id: customerId }).unwrap();
      showToast({
        title: "Success",
        message: "Customer deleted successfully.",
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete customer", error);
      showToast({
        title: "Error",
        message: "Failed to delete customer",
        type: "error",
      });
    }
  };

  const loading = isFetching || isLoading;

  if (loading) return <LoadingComponent loading={loading} />;
  if (isError) return <FetchingError />;
  if (!isSuccess || !customerDetails) return null;

  return (
    <div className="space-y-4">
      <PageTitle title="Customer Profile" />

      <PageSummary
        icon={User}
        title={customerDetails.name || "Unknown Customer"}
        description={customerDetails.companyName || "No Company Associated"}
        actionComponent={
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={() => handleNavigateToEdit()}
              type="edit"
              useText="Edit Customer"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Customer?"
              rightActionTitle="Delete"
              content={
                <p className="text-gray-500 text-center">
                  This action cannot be undone. This will permanently delete this
                  customer profile.
                </p>
              }
              onConfirmClicked={() => handleDeleteCustomer(id as string)}
              trigger={
                <Button
                  variant="destructive"
                  className="bg-red-700 text-white hover:bg-red-800"
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
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm bg-blue-50">
              <User className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {customerDetails.name}
            </h2>
            <p className="text-sm text-gray-500">
              {customerDetails.companyName || "Individual"}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account Status
              </h3>
            </div>
            <div className="p-5 flex flex-col items-center space-y-4">
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {customerDetails.status && (
                  <Badge
                    variant="secondary"
                    className={`px-4 py-1.5 uppercase tracking-wider text-[10px] ${customerDetails.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                      }`}
                  >
                    {typeof customerDetails.status === "string"
                      ? customerDetails.status
                      : "Active"}
                  </Badge>
                )}
              </div>

              <div className="w-full pt-2 border-t border-gray-100 flex justify-center">
                <CustomSwitchComponent
                  control={control}
                  name="status"
                  label={customerDetails.status === "active" ? "Set Inactive" : "Set Active"}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                System Info
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {customerDetails.loggedBy && (
                <DetailItem
                  label="Registered By"
                  value={
                    typeof customerDetails.loggedBy === "string"
                      ? customerDetails.loggedBy
                      : `${customerDetails.loggedBy.firstName || ""} ${customerDetails.loggedBy.lastName || ""
                      }`
                  }
                  icon={<UserCircle className="w-4 h-4 text-gray-400" />}
                />
              )}
              <DetailItem
                label="Date Added"
                value={
                  customerDetails.createdAt
                    ? formatDate(customerDetails.createdAt)
                    : "N/A"
                }
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem
                label="Last Updated"
                value={
                  customerDetails.updatedAt
                    ? formatDate(customerDetails.updatedAt)
                    : "N/A"
                }
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Contact Information</h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem
                label="Email Address"
                value={customerDetails.email}
                icon={<Mail className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem
                label="Phone Number"
                value={customerDetails.phone}
                icon={<Phone className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem
                label="Company"
                value={customerDetails.companyName}
                icon={<Building2 className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem
                label="Location"
                value={customerDetails.location}
                icon={<MapPin className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Notes & Description</h3>
            </div>

            <div className="p-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {customerDetails.notes ||
                  "No additional notes recorded for this customer."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSummary;