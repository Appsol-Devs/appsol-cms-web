import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, generateRandomColor } from "@/lib/helpers";
import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { IRescheduleFormFields } from "../common/reschedules";
import type { ICustomer } from "@/pages/customer/common/customers";
import {
  useAddRescheduleMutation,
  useLazyGetARescheduleQuery,
  useUpdateRescheduleMutation,
} from "../common/reschedulesApi";
import type { IReschedule } from "../common/reschedules";
import RescheduleFormContent from "./RescheduleFormContent";
import { allRoutes } from "@/utils/routes";

const RescheduleForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialData = (location.state as any)?.initialData as IReschedule | undefined;

  const [createMutation, { isLoading: isCreating }] = useAddRescheduleMutation();
  const [updateMutation, { isLoading: isUpdating }] = useUpdateRescheduleMutation();
  const [getSelectedData, { isLoading: isGetting }] = useLazyGetARescheduleQuery();

  const form = useForm<IRescheduleFormFields>({
    defaultValues: {
      title: "",
      reason: "",
      colorCode: generateRandomColor(),
      originalDateTime: "",
      newDateTime: "",
      status: { label: "pending", value: "pending" },
    } as any,
  });
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<IReschedule | null>(null);

  const fetchData = async (selectedId: string) => {
    if (!selectedId) return;
    try {
      const res = await getSelectedData(selectedId).unwrap();
      if (res) setSelectedData(res);
    } catch {
      // handled by middleware/toast
    }
  };

  const resetFormWithData = (data: IReschedule) => {
    if (!data) return;
    reset({
      ...data,
      customerId:
        data.customerId && typeof data.customer !== "string"
          ? {
              label: `${(data.customer as any)?.name ?? ""}${
                (data.customer as any)?.companyName
                  ? " - " + (data.customer as any).companyName
                  : ""
              }`,
              value: data.customer as ICustomer,
            }
          : data.customerId
            ? { label: data.customerId, value: { _id: data.customerId } as any }
            : undefined,
      targetEntityType: data.targetEntityType
        ? { label: data.targetEntityType, value: data.targetEntityType }
        : undefined,
      status: data.status ? { label: data.status, value: data.status } : undefined,
    });
  };

  useEffect(() => {
    if (initialData && !id) {
      resetFormWithData(initialData);
    }
  }, [initialData, id]);

  useEffect(() => {
    if (id) fetchData(id);
  }, [id]);

  useEffect(() => {
    if (id && selectedData) resetFormWithData(selectedData);
  }, [id, selectedData]);

  const handleDataSubmission = async (payload: any) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateMutation({ _id: id, ...payload }).unwrap()
        : await createMutation(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id ? "Reschedule updated successfully." : "Reschedule created successfully.",
          type: "success",
        });
        navigate(allRoutes.PORTAL + allRoutes.RESCHEDULES);
      }
    } catch {
      showToast({
        title: "Error",
        message: id ? "Failed to update reschedule." : "Failed to create reschedule.",
        type: "error",
      });
    }
  };

  const submitData = () => {
    const data = getValues();

    const requiredFields: { field: unknown; message: string }[] = [
      { field: data.title?.trim(), message: "Title is required." },
      { field: data.customerId?.value?._id, message: "Customer is required." },
      { field: data.targetEntityType?.value, message: "Target Entity Type is required." },
      { field: data.originalDateTime, message: "Original Date & Time is required." },
      { field: data.newDateTime, message: "New Date & Time is required." },
      { field: data.status?.value, message: "Status is required." },
      { field: data.reason?.trim(), message: "Reason is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Validation", message, type: "info", duration: 2000 });
        return;
      }
    }

    const payload = cleanPayload({
      title: data.title?.trim(),
      customerId: data.customerId?.value?._id,
      targetEntityType: data.targetEntityType?.value,
      reason: data.reason?.trim() || undefined,
      originalDateTime: data.originalDateTime,
      newDateTime: data.newDateTime,
      colorCode: data.colorCode || undefined,
      status: data.status?.value,
    });

    handleDataSubmission(payload);
  };

  const validateBeforeOpen = async () => {
    const data = getValues();

    const requiredFields: { field: unknown; message: string }[] = [
      { field: data.title?.trim(), message: "Title is required." },
      { field: data.customerId?.value?._id, message: "Customer is required." },
      { field: data.targetEntityType?.value, message: "Target Entity Type is required." },
      { field: data.originalDateTime, message: "Original Date & Time is required." },
      { field: data.newDateTime, message: "New Date & Time is required." },
      { field: data.status?.value, message: "Status is required." },
      { field: data.reason?.trim(), message: "Reason is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Validation", message, type: "info", duration: 2000 });
        return false;
      }
    }

    return true;
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Reschedule",
      icon: <CalendarClock className="w-4 h-4" />,
      data: [
        { label: "Title", value: values?.title, required: true },
        {
          label: "Customer",
          value: (values?.customerId?.label as string) || "",
          required: true,
        },
        {
          label: "Entity Type",
          value: (values?.targetEntityType?.label as string) || "",
          required: true,
        },
        { label: "Original Date", value: values?.originalDateTime, required: true },
        { label: "New Date", value: values?.newDateTime, required: true },
        { label: "Status", value: (values?.status?.label as string) || "", required: true },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div className="space-y-3">
      <MutationFormTemplate<IRescheduleFormFields>
        form={form}
        pageSummary={{
          title: id ? "Update Reschedule" : "Create New Reschedule",
          description: "Schedule, track, and manage rescheduled activities.",
          icon: CalendarClock,
        }}
        formContent={<RescheduleFormContent form={form} isLoading={isLoading} />}
        submitData={submitData}
        pageTitle={id ? `Update Reschedule - ${selectedData?.rescheduleCode ?? ""}` : "Add Reschedule"}
        loading={isLoading}
        confirmOnSubmit
        validateBeforeOpen={validateBeforeOpen}
        confirmSubmitTitle={id ? "Confirm Reschedule Update" : "Confirm Reschedule Creation"}
        confirmSubmitActionLabel={id ? "Save Changes" : "Create Reschedule"}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Reschedule Summary",
          summarySaveButtonText: id ? "Save Changes" : "Create Reschedule",
        }}
      />
    </div>
  );
};

export default RescheduleForm;

