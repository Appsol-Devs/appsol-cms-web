import type { DropDownOption } from "@/components/DropdownComponent";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type DefaultValues } from "react-hook-form";
import { useEffect, useState } from "react";
import { showToast } from "@/components/ui/CustomToast";
import {
  cleanPayload,
  formatMutationSummaryDateTime,
  resetMutationForm,
} from "@/lib/helpers";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import { BookOpenText } from "lucide-react";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";

import { allRoutes } from "@/utils/routes";
import type {
  IFeatureRequest,
  TFeatureRequestStatus,
} from "../common/feature-request";
import {
  useAddFeatureRequestMutation,
  useUpdateFeatureRequestMutation,
  useLazyGetAFeatureRequestQuery,
} from "../common/featureRequestApi";
import { useLazyGetSoftwaresQuery } from "@/pages/settings/common/settingsApi";
import { lookup_params } from "@/lib/api";
import type { ISoftware } from "@/pages/settings/common/settings";
import FeatureRequestFormContent from "./FeatureRequestFormContent";

export type IFeatureRequestFields = Omit<
  IFeatureRequest,
  "_id" | "assignedTo" | "requestedDate" | "customerId" | "softwareId"
> & {
  title: string;
  customerId: DropDownOption<string> | string;
  softwareId: DropDownOption<string> | string;
  description: string;
  notes: string;
  priority: string;
  status: string;
  requestedDate: string;
  assignedTo: DropDownOption<string>[];
};

const FeatureRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [createFeatureRequest, { isLoading: isCreating }] =
    useAddFeatureRequestMutation();
  const [updateFeatureRequest, { isLoading: isUpdating }] =
    useUpdateFeatureRequestMutation();
  const [getAFeatureRequest, { isLoading: isGetting }] =
    useLazyGetAFeatureRequestQuery();

  const [getSoftwares] = useLazyGetSoftwaresQuery();
  const [softwareList, setSoftwareList] = useState<ISoftware[]>([]);

  const form = useForm<IFeatureRequestFields>({});

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
  }, [getSoftwares]);

  const getEmptyFeatureRequestValues = () => ({
    title: "",
    customerId: undefined,
    softwareId: undefined,
    description: "",
    notes: "",
    priority: "",
    status: "new" as TFeatureRequestStatus,
    requestedDate: "",
    assignedTo: [] as DropDownOption<string>[],
  });

  const [loadedData, setLoadedData] = useState<IFeatureRequest | null>(null);

  const resetFormWithData = (data: IFeatureRequest) => {
    reset({
      title: data.title || "",
      description: data.description || "",
      notes: data.notes || "",
      priority: data.priority || "",
      status: data.status || "new",
      requestedDate: data.requestedDate || "",
      customerId: data.customerId
        ? {
            value: data.customerId,
            label:
              typeof data.customer === "string"
                ? data.customer
                : (data.customer?.name ?? ""),
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
    resetMutationForm<IFeatureRequestFields>(
      form,
      getEmptyFeatureRequestValues() as DefaultValues<IFeatureRequestFields>,
    );
  };

  const fetchAndResetData = async (requestId: string) => {
    try {
      const data = await getAFeatureRequest(requestId).unwrap();
      if (data) {
        setLoadedData(data);
        resetFormWithData(data);
      }
    } catch (err) {
      console.error("Error fetching feature request:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAndResetData(id);
    }
  }, [id]);

  const handleDataSubmission = async (payload: Partial<IFeatureRequest>) => {
    try {
      const res = id
        ? await updateFeatureRequest({ ...payload, _id: id }).unwrap()
        : await createFeatureRequest(payload as IFeatureRequest).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Feature Request updated successfully."
            : "Feature Request created successfully.",
          type: "success",
        });
        navigate(allRoutes.PORTAL + "/feature-requests");
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

  const submitData = () => {
    const data = getValues();

    const requiredFields = id
      ? [
          { field: data.title, message: "Title is required." },
          { field: data.priority, message: "Priority is required." },
          { field: data.status, message: "Status is required." },
        ]
      : [
          { field: data.title, message: "Title is required." },
          {
            field: extractValue(data.customerId),
            message: "Customer is required.",
          },
          {
            field: extractValue(data.softwareId),
            message: "Software is required.",
          },
          { field: data.priority, message: "Priority is required." },
          { field: data.status, message: "Status is required." },
          { field: data.requestedDate, message: "Requested date is required." },
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
      priority: data.priority,
      status: data.status,
      assignedTo: data.assignedTo?.map((user: any) => extractValue(user)) || [],
    };

    const payload = cleanPayload(
      id
        ? basePayload
        : {
            ...basePayload,
            customerId: extractValue(data.customerId),
            softwareId: extractValue(data.softwareId),
            requestedDate: data.requestedDate,
          },
    ) as Partial<IFeatureRequest>;

    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Request Details",
      icon: <BookOpenText className="w-4 h-4" />,
      data: [
        { label: "Title", value: values?.title, required: true },
        { label: "Priority", value: values?.priority, required: true },
        { label: "Status", value: values?.status, required: true },
        {
          label: "Customer",
          value: getCustomerLabel(values?.customerId) as string,
          required: !id,
        },
        {
          label: "Software",
          value: getSoftwareLabel(values?.softwareId) as string,
          required: !id,
        },
        {
          label: "Requested Date",
          value: formatMutationSummaryDateTime(values?.requestedDate),
          required: !id,
        },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <MutationFormTemplate<IFeatureRequestFields>
      form={form}
      pageSummary={{
        title: id ? "Update Feature Request" : "Create Feature Request",
        description: `Enter the details for the feature request you want to ${id ? "update" : "create"}.`,
        icon: BookOpenText,
      }}
      formContent={
        <FeatureRequestFormContent
          isUpdate={!!id}
          form={form}
          isLoading={isLoading}
        />
      }
      submitData={submitData}
      pageTitle={id ? `Update Feature Request` : "Add Feature Request"}
      loading={isLoading}
      mutationFormSummary={{
        summaryData: summarySections,
        summaryMainTitle: "Request Details Summary",
        summarySaveButtonText: id ? "Save Changes" : "Save Request",
      }}
      onResetForm={handleResetForm}
    />
  );
};

export default FeatureRequestForm;
