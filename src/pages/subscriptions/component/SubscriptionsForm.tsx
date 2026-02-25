import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import { Calendar, Receipt, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type {
  ISubscription,
  ISubscriptionFields,
} from "../common/subscriptions";
import {
  useAddSubscriptionMutation,
  useLazyGetASubscriptionQuery,
  useUpdateSubscriptionMutation,
} from "../common/subscriptionsApi";
import SubscriptionsFormContent from "./SubscriptionsFormContent";

const mapStatusToLabel = (status?: string): string => {
  switch (status) {
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "cancelled":
      return "Cancelled";
    case "pending":
      return "Pending";
    default:
      return status ?? "";
  }
};

const SubscriptionsForm = () => {
  const { id } = useParams();

  const [createNewMutation, { isLoading: isCreating }] =
    useAddSubscriptionMutation();
  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateSubscriptionMutation();
  const [getSelectedData, { isLoading: isGetting }] =
    useLazyGetASubscriptionQuery();
  const form = useForm<ISubscriptionFields>({
    defaultValues: { autoRenew: true },
  });
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<ISubscription | null>(null);

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getSelectedData(id).unwrap();
      if (res) {
        setSelectedData(res);
      }
    } catch (err) {
      if (!err) return;
      console.error(err);
    }
  };

  const resetFormWithData = (data: ISubscription) => {
    if (!data) return;

    reset({
      ...data,
      customerId: data.customerId
        ? {
            value: data.customerId,
            label: data.customer?.name ?? "",
          }
        : undefined,
      softwareId: data.softwareId
        ? {
            value: data.softwareId,
            label: data.software?.name ?? "",
          }
        : undefined,
      subscriptionTypeId: data.subscriptionTypeId
        ? {
            value: data.subscriptionTypeId,
            label: data.subscriptionType?.name ?? "",
          }
        : undefined,
      status: data.status
        ? {
            value: data.status,
            label: mapStatusToLabel(data.status),
          }
        : undefined,
    });
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedData) {
      resetFormWithData(selectedData);
    }
  }, [selectedData]);

  const handleDataSubmission = async (payload: Partial<ISubscription>) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateMutation({ _id: id, ...payload }).unwrap()
        : await createNewMutation(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Subscription updated successfully."
            : "Subscription created successfully.",
          type: "success",
        });
        navigate(-1);
      }
    } catch (error) {
      if (!error) return;
    }
  };

  const submitData = () => {
    const data = getValues();

    const requiredFields = [
      { field: data.customerId, message: "Customer is required." },
      { field: data.softwareId, message: "Software is required." },
      { field: data.subscriptionTypeId, message: "Subscription type is required." },
      { field: data.status?.value, message: "Status is required." },
      { field: data.startDate, message: "Start date is required." },
      {
        field: data.currentPeriodStart,
        message: "Current period start is required.",
      },
      {
        field: data.currentPeriodEnd,
        message: "Current period end is required.",
      },
      {
        field: data.nextBillingDate,
        message: "Next billing date is required.",
      },
      {
        field: data.amount !== undefined && data.amount !== null,
        message: "Amount is required.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({
          title: "Validation",
          message,
          type: "info",
          duration: 2000,
        });
        return;
      }
    }

    if (Number(data.amount ?? 0) < 0) {
      showToast({
        title: "Validation",
        message: "Amount must be 0 or greater.",
        type: "info",
        duration: 2000,
      });
      return;
    }

    const payload = cleanPayload({
      customerId: data.customerId?.value,
      softwareId: data.softwareId?.value,
      subscriptionTypeId: data.subscriptionTypeId?.value,
      status: data.status?.value,
      startDate: data.startDate,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      nextBillingDate: data.nextBillingDate,
      amount: Number(data.amount ?? 0),
      autoRenew: data.autoRenew ?? true,
      notes: data.notes,
    });

    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Customer & Software",
      icon: <User className="w-4 h-4" />,
      data: [
        {
          label: "Customer",
          value: values?.customerId?.label as string,
          required: true,
        },
        {
          label: "Software",
          value: values?.softwareId?.label as string,
          required: true,
        },
        {
          label: "Subscription Type",
          value: values?.subscriptionTypeId?.label as string,
          required: true,
        },
        {
          label: "Status",
          value: values?.status?.label as string,
          required: true,
        },
      ],
    },
    {
      title: "Billing Period",
      icon: <Calendar className="w-4 h-4" />,
      data: [
        {
          label: "Start Date",
          value: values?.startDate
            ? new Date(values.startDate).toLocaleDateString()
            : "",
          required: true,
        },
        {
          label: "Current Period",
          value:
            values?.currentPeriodStart && values?.currentPeriodEnd
              ? `${new Date(values.currentPeriodStart).toLocaleDateString()} - ${new Date(values.currentPeriodEnd).toLocaleDateString()}`
              : "",
          required: true,
        },
        {
          label: "Next Billing",
          value: values?.nextBillingDate
            ? new Date(values.nextBillingDate).toLocaleDateString()
            : "",
          required: true,
        },
      ],
    },
    {
      title: "Amount & Settings",
      icon: <Receipt className="w-4 h-4" />,
      data: [
        {
          label: "Amount",
          value: values?.amount?.toString() ?? "0",
          required: true,
        },
        {
          label: "Auto Renew",
          value: values?.autoRenew ? "Yes" : "No",
          required: false,
        },
        { label: "Notes", value: values?.notes, required: false },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<ISubscriptionFields>
        form={form}
        pageSummary={{
          title: id ? "Update Subscription" : "Create New Subscription",
          description: `Enter all the details of the subscription you want to ${
            id ? "update" : "create"
          }.`,
          icon: Receipt,
        }}
        formContent={
          <SubscriptionsFormContent
            form={form}
            isLoading={isLoading}
            isUpdate={!!id}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Subscription - ${selectedData?.subscriptionCode ?? ""}`
            : "Add Subscription"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Subscription Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Subscription",
        }}
      />
    </div>
  );
};

export default SubscriptionsForm;
