import type { DropDownOption } from "@/components/DropdownComponent";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { showToast } from "@/components/ui/CustomToast";
import {
  cleanPayload,
  formatMutationSummaryDateTime,
  resetMutationForm,
} from "@/lib/helpers";
import type { DefaultValues } from "react-hook-form";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import { BookOpenText } from "lucide-react";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";

import { allRoutes } from "@/utils/routes";

import {
  useLazyGetSetupStatusesQuery,
  useLazyGetSoftwaresQuery,
} from "@/pages/settings/common/settingsApi";
import { lookup_params } from "@/lib/api";
import type { ISetupStatus, ISoftware } from "@/pages/settings/common/settings";
import CustomerSetupFormContent from "./CustomerSetupFormContent";
import type { ICustomerSetup } from "./customerSetup";
import {
  useAddCustomerSetupMutation,
  useUpdateCustomerSetupMutation,
  useLazyGetACustomerSetupQuery,
} from "./customerSetupApi";
import { SETUP_STATUS_LABEL_MAP } from "@/lib/enums";
import type { ICustomer } from "../customer/common/customers";

export type ICustomerSetupFields = Omit<
  ICustomerSetup,
  | "_id"
  | "assignedTo"
  | "scheduledStart"
  | "scheduledEnd"
  | "actualCompletionDate"
  | "customerId"
  | "softwareId"
> & {
  title: string;
  customer: DropDownOption<ICustomer>;
  softwareId: DropDownOption<string> | string;
  description: string;
  notes: string;
  priority: DropDownOption<string> | string;
  status: DropDownOption<string> | string;
  setupStatus: DropDownOption<string> | string;
  scheduledStart: string;
  scheduledEnd: string;
  actualCompletionDate?: string;
  assignedTo: DropDownOption<string>[];
  setupStatusId: DropDownOption<string> | string;
  addToCalendar?: boolean;
};

const CustomerSetupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [createCustomerSetup, { isLoading: isCreating }] =
    useAddCustomerSetupMutation();
  const [updateCustomerSetup, { isLoading: isUpdating }] =
    useUpdateCustomerSetupMutation();
  const [getACustomerSetup, { isLoading: isGetting }] =
    useLazyGetACustomerSetupQuery();

  const [getSoftwares] = useLazyGetSoftwaresQuery();
  const [softwareList, setSoftwareList] = useState<ISoftware[]>([]);
  const [getSetupStatuses] = useLazyGetSetupStatusesQuery();
  const [setupStatusList, setSetupStatusList] = useState<ISetupStatus[]>([]);

  const form = useForm<ICustomerSetupFields>({
    defaultValues: {
      addToCalendar: true,
    },
  });

  const { watch, getValues, reset } = form;
  const values = watch();

  useEffect(() => {
    getSoftwares(lookup_params)
      .unwrap()
      .then((res: { contents?: ISoftware[] }) => {
        if (res?.contents) {
          setSoftwareList(res.contents);
        }
      })
      .catch((err) => console.error(err));
    getSetupStatuses(lookup_params)
      .unwrap()
      .then((res: { contents?: ISetupStatus[] }) => {
        if (res?.contents) {
          setSetupStatusList(res.contents);
        }
      })
      .catch((err) => console.error(err));
  }, [getSoftwares, getSetupStatuses]);

  const getEmptyCustomerSetupValues = () => ({
    title: "",
    customerId: undefined,
    softwareId: undefined,
    description: "",
    notes: "",
    priority: "",
    status: "scheduled" as ICustomerSetupFields["status"],
    setupStatus: undefined,
    setupStatusId: undefined,
    scheduledStart: "",
    scheduledEnd: "",
    actualCompletionDate: "",
    assignedTo: [] as DropDownOption<string>[],
    addToCalendar: true,
  });

  const [loadedData, setLoadedData] = useState<ICustomerSetup | null>(null);

  const resetFormWithData = (data: ICustomerSetup) => {
    const setupStatusId =
      data.setupStatusId ||
      (typeof data.setupStatus !== "string"
        ? data.setupStatus?._id
        : undefined);
    const setupStatusLabel =
      typeof data.setupStatus === "string"
        ? SETUP_STATUS_LABEL_MAP[data.setupStatus] || data.setupStatus
        : ((SETUP_STATUS_LABEL_MAP[data.setupStatus?.name ?? ""] ||
            data.setupStatus?.name) ??
          "");

    reset({
      title: data.title || "",
      description: data.description || "",
      notes: data.notes || "",
      priority: data.priority || "",
      status: data.status || "scheduled",
      scheduledStart: data.scheduledStart || "",
      scheduledEnd: data.scheduledEnd || "",
      actualCompletionDate: data.actualCompletionDate || "",
      addToCalendar: data.addToCalendar ?? false,
      customer: data.customerId
        ? {
            value: data.customer,
            label: data.customer?.name ?? "",
          }
        : undefined,
      softwareId: data.softwareId
        ? {
            value: data.softwareId,
            label:
              typeof data.software === "string"
                ? data.software
                : (data.software?.name ?? ""),
          }
        : undefined,
      setupStatus: setupStatusId
        ? { value: setupStatusId, label: setupStatusLabel }
        : undefined,
      setupStatusId: setupStatusId
        ? { value: setupStatusId, label: setupStatusLabel }
        : undefined,
      assignedTo:
        data.assignedTo
          ?.map((user) => {
            if (typeof user === "string") {
              return { value: user, label: user } as DropDownOption<string>;
            }
            const userId = user._id;
            if (!userId) return null;
            const name =
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
              user.email ||
              userId;
            return { value: userId, label: name } as DropDownOption<string>;
          })
          .filter((opt): opt is DropDownOption<string> => opt != null) ?? [],
    });
  };

  const handleResetForm = () => {
    if (id && loadedData) {
      resetFormWithData(loadedData);
      return;
    }
    resetMutationForm<ICustomerSetupFields>(
      form,
      getEmptyCustomerSetupValues() as DefaultValues<ICustomerSetupFields>,
    );
  };

  const fetchAndResetData = async (setupId: string) => {
    try {
      const data = await getACustomerSetup(setupId).unwrap();
      if (data) {
        setLoadedData(data);
        resetFormWithData(data);
      }
    } catch (err) {
      console.error("Error fetching customer setup:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAndResetData(id);
    }
  }, [id]);

  const handleDataSubmission = async (payload: Partial<ICustomerSetup>) => {
    try {
      const res = id
        ? await updateCustomerSetup({ ...payload, _id: id }).unwrap()
        : await createCustomerSetup(payload as ICustomerSetup).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Customer Setup updated successfully."
            : "Customer Setup created successfully.",
          type: "success",
        });
        navigate(allRoutes.PORTAL + "/customer-setups");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const extractValue = (field: any) =>
    typeof field === "string" ? field : field?.value;
  const getCustomerLabel = (field: any) =>
    typeof field === "string" ? field : field?.label;

  const getSoftwareLabel = (val: any) => {
    if (!val) return "";
    if (typeof val !== "string") return val.label;
    const found = softwareList.find((s) => s._id === val);
    return found ? found.name : val;
  };
  const getSetupStatusLabel = (val: any) => {
    if (!val) return "";
    if (typeof val !== "string") return val.label;
    const found = setupStatusList.find((s) => s._id === val);
    return found ? SETUP_STATUS_LABEL_MAP[found.name ?? ""] || found.name : val;
  };

  const submitData = () => {
    const data = getValues();

    const selectedStatusId = extractValue(data.setupStatus);
    const foundStatus = setupStatusList.find((s) => s._id === selectedStatusId);

    const requiredFields = id
      ? [
          { field: data.title, message: "Title is required." },
          { field: data.priority, message: "Priority is required." },
          { field: data.status, message: "Setup Status is required." },
        ]
      : [
          { field: data.setupStatus, message: "Setup status is required." },
          { field: data.title, message: "Title is required." },
          {
            field: extractValue(data.customer.value._id),
            message: "Customer is required.",
          },
          {
            field: extractValue(data.softwareId),
            message: "Software is required.",
          },
          { field: data.priority, message: "Priority is required." },
          { field: data.status, message: "Customer Setup Status is required." },
          {
            field: data.scheduledStart,
            message: "Scheduled start date is required.",
          },
          {
            field: data.scheduledEnd,
            message: "Scheduled end date is required.",
          },
          { field: data.description, message: "Description is required." },
        ];

    for (const { field, message } of requiredFields) {
      if (!field || (Array.isArray(field) && field.length === 0)) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const basePayload = {
      title: data.title,
      description: data.description,
      notes: data.notes,
      priority: (data.priority as DropDownOption<string>).value,
      status: (data.status as DropDownOption<string>).value,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      actualCompletionDate: data.actualCompletionDate,
      assignedTo: data.assignedTo?.map((user: any) => extractValue(user)) || [],
      setupStatusId: selectedStatusId,
      setupStatus: foundStatus?.name?.toLowerCase() || "",
      customerId: data.customer.value._id,
      softwareId: extractValue(data.softwareId),
      addToCalendar: data.addToCalendar,
    };

    const payload = cleanPayload(
      id
        ? basePayload
        : {
            ...basePayload,
            softwareId: extractValue(data.softwareId),
          },
    ) as Partial<ICustomerSetup>;

    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Setup Details",
      icon: <BookOpenText className="w-4 h-4" />,
      data: [
        { label: "Title", value: values?.title, required: true },
        {
          label: "Priority",
          value: (values?.priority as DropDownOption<string>)?.value,
          required: true,
        },
        {
          label: "Customer Setup Status",
          value: (values?.status as DropDownOption<string>)?.value,
          required: true,
        },
        {
          label: "Setup Status",
          value: getSetupStatusLabel(values?.setupStatus) as string,
          required: true,
        },

        {
          label: "Customer",
          value: getCustomerLabel(values?.customer?.value.name ?? "") as string,
          required: !id,
        },
        {
          label: "Software",
          value: getSoftwareLabel(values?.softwareId) as string,
          required: !id,
        },
        {
          label: "Scheduled Start",
          value: formatMutationSummaryDateTime(values?.scheduledStart),
          required: !id,
        },
        {
          label: "Scheduled End",
          value: formatMutationSummaryDateTime(values?.scheduledEnd),
          required: false,
        },
        {
          label: "Actual Completion",
          value: formatMutationSummaryDateTime(values?.actualCompletionDate),
          required: false,
        },
        {
          label: "Add to Calendar",
          value: values?.addToCalendar ? "Yes" : "No",
          required: false,
        },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <MutationFormTemplate<ICustomerSetupFields>
      form={form}
      pageSummary={{
        title: id ? "Update Customer Setup" : "Create Customer Setup",
        description: `Enter the details for the customer setup you want to ${id ? "update" : "create"}.`,
        icon: BookOpenText,
      }}
      formContent={
        <CustomerSetupFormContent
          isUpdate={!!id}
          form={form}
          isLoading={isLoading}
        />
      }
      submitData={submitData}
      pageTitle={id ? `Update Customer Setup` : "Add Customer Setup"}
      loading={isLoading}
      mutationFormSummary={{
        summaryData: summarySections,
        summaryMainTitle: "Setup Details Summary",
        summarySaveButtonText: id ? "Save Changes" : "Save Setup",
      }}
      onResetForm={handleResetForm}
    />
  );
};

export default CustomerSetupForm;
