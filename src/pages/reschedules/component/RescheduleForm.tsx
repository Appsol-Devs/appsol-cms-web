import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, formatMutationSummaryDateTime } from "@/lib/helpers";
import { getTargetEntityTypeColor } from "@/lib/enums";
import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { IRescheduleFormFields, TargetEntityType } from "../common/reschedules";
import type { ICustomer } from "@/pages/customer/common/customers";
import {
  useAddRescheduleMutation,
  useLazyGetARescheduleQuery,
  useUpdateRescheduleMutation,
} from "../common/reschedulesApi";
import type { IReschedule } from "../common/reschedules";
import RescheduleFormContent, {
  TARGET_ENTITY_TYPE_OPTIONS,
} from "./RescheduleFormContent";
import { allRoutes } from "@/utils/routes";

function getTargetEntityTypeFromForm(
  v: IRescheduleFormFields["targetEntityType"],
): TargetEntityType | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v as TargetEntityType;
  return v.value;
}

function validateFromToRangeOrder(from: string, to: string): boolean {
  const fromMs = new Date(from).getTime();
  const toMs = new Date(to).getTime();
  if (!Number.isNaN(fromMs) && !Number.isNaN(toMs) && toMs < fromMs) {
    showToast({
      title: "Validation",
      message: "“To” must be on or after “From”.",
      type: "info",
      duration: 2500,
    });
    return false;
  }
  return true;
}

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
      originalDateTime: "",
      newDateTime: "",
      from: "",
      to: "",
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
    const fromVal = data.from?.trim() ? data.from : data.newDateTime ?? "";
    const toVal = data.to?.trim() ? data.to : data.newDateTime ?? "";
    reset({
      ...data,
      from: fromVal,
      to: toVal,
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
        ? (() => {
            const opt = TARGET_ENTITY_TYPE_OPTIONS.find(
              (o) => o.value === data.targetEntityType,
            );
            return opt
              ? { label: opt.label, value: opt.value }
              : {
                  label: data.targetEntityType,
                  value: data.targetEntityType as TargetEntityType,
                };
          })()
        : undefined,
      status: data.status
        ? { label: data.status, value: data.status }
        : { label: "pending", value: "pending" },
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
          message: id ? "Schedule updated successfully." : "Schedule created successfully.",
          type: "success",
        });
        navigate(allRoutes.PORTAL + allRoutes.RESCHEDULES);
      }
    } catch {
      showToast({
        title: "Error",
        message: id ? "Failed to update schedule." : "Failed to create schedule.",
        type: "error",
      });
    }
  };

  const submitData = () => {
    const data = getValues();

    const requiredFields: { field: unknown; message: string }[] = [
      { field: data.title?.trim(), message: "Title is required." },
      { field: data.customerId?.value?._id, message: "Customer is required." },
      {
        field: getTargetEntityTypeFromForm(data.targetEntityType),
        message: "Target Entity Type is required.",
      },
      { field: data.originalDateTime, message: "Original Date & Time is required." },
      { field: data.newDateTime, message: "New Date & Time is required." },
      { field: data.from, message: "From date & time is required." },
      { field: data.to, message: "To date & time is required." },
      { field: data.status?.value, message: "Status is required." },
      { field: data.reason?.trim(), message: "Reason is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Validation", message, type: "info", duration: 2000 });
        return;
      }
    }

    if (!validateFromToRangeOrder(String(data.from), String(data.to))) return;

    const entityType = getTargetEntityTypeFromForm(data.targetEntityType);

    const payload = cleanPayload({
      title: data.title?.trim(),
      customerId: data.customerId?.value?._id,
      targetEntityType: entityType,
      reason: data.reason?.trim() || undefined,
      originalDateTime: data.originalDateTime,
      newDateTime: data.newDateTime,
      from: data.from,
      to: data.to,
      colorCode: getTargetEntityTypeColor(entityType) ?? undefined,
      status: data.status?.value,
    });

    handleDataSubmission(payload);
  };

  const validateBeforeOpen = async () => {
    const data = getValues();

    const requiredFields: { field: unknown; message: string }[] = [
      { field: data.title?.trim(), message: "Title is required." },
      { field: data.customerId?.value?._id, message: "Customer is required." },
      {
        field: getTargetEntityTypeFromForm(data.targetEntityType),
        message: "Target Entity Type is required.",
      },
      { field: data.originalDateTime, message: "Original Date & Time is required." },
      { field: data.newDateTime, message: "New Date & Time is required." },
      { field: data.from, message: "From date & time is required." },
      { field: data.to, message: "To date & time is required." },
      { field: data.status?.value, message: "Status is required." },
      { field: data.reason?.trim(), message: "Reason is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Validation", message, type: "info", duration: 2000 });
        return false;
      }
    }

    if (!validateFromToRangeOrder(String(data.from), String(data.to))) return false;

    return true;
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Schedule",
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
          value: (() => {
            const v = getTargetEntityTypeFromForm(values?.targetEntityType);
            if (!v) return "";
            const label = TARGET_ENTITY_TYPE_OPTIONS.find((o) => o.value === v)
              ?.label;
            return typeof label === "string" ? label : v;
          })(),
          required: true,
        },
        {
          label: "Original Date",
          value: formatMutationSummaryDateTime(values?.originalDateTime),
          required: true,
        },
        {
          label: "New Date",
          value: formatMutationSummaryDateTime(values?.newDateTime),
          required: true,
        },
        {
          label: "From (range)",
          value: formatMutationSummaryDateTime(values?.from),
          required: true,
        },
        {
          label: "To (range)",
          value: formatMutationSummaryDateTime(values?.to),
          required: true,
        },
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
          title: id ? "Update Schedule" : "Create New Schedule",
          description: "Schedule, track, and manage scheduled activities.",
          icon: CalendarClock,
        }}
        formContent={<RescheduleFormContent form={form} isLoading={isLoading} />}
        submitData={submitData}
        pageTitle={id ? `Update Schedule - ${selectedData?.rescheduleCode ?? ""}` : "Add Schedule"}
        loading={isLoading}
        confirmOnSubmit
        validateBeforeOpen={validateBeforeOpen}
        confirmSubmitTitle={id ? "Confirm Schedule Update" : "Confirm Schedule Creation"}
        confirmSubmitActionLabel={id ? "Save Changes" : "Create Schedule"}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Schedule Summary",
          summarySaveButtonText: id ? "Save Changes" : "Create Schedule",
        }}
      />
    </div>
  );
};

export default RescheduleForm;

