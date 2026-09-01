import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, resetMutationForm } from "@/lib/helpers";
import { Phone, Notebook, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { IComplaint } from "../common/complaints";
import { COMPLAINT_STATUS_ENUM } from "@/lib/enums";
import {
  useAddComplaintMutation,
  useLazyGetAComplaintQuery,
  useUpdateComplaintMutation,
} from "../common/complaintsApi";
import type { DropDownOption } from "@/components/DropdownComponent";
import ComplaintsFormContent from "./ComplaintsFormContent";

export type IComplaintFields = Omit<IComplaint, "id"> & {
  customerId?: DropDownOption<string>;
  complaintTypeId?: string | DropDownOption<string> | null;
  complaintCategoryId?: string | DropDownOption<string> | null;
  relatedSoftwareId?: string | DropDownOption<string> | null;
  status?: string | DropDownOption<string> | null;
};

const toId = (
  val?: string | DropDownOption<string> | null,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.value;
};

const toLabel = (
  val?: string | DropDownOption<string> | null,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.label?.toString();
};

const ComplaintsForm = () => {
  const { id } = useParams();

  const [createNewMutation, { isLoading: isCreating }] =
    useAddComplaintMutation();
  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateComplaintMutation();
  const [getSelectedData, { isLoading: isGetting }] =
    useLazyGetAComplaintQuery();
  const form = useForm<IComplaintFields>({
    defaultValues: {
      status: COMPLAINT_STATUS_ENUM.Open,
    },
  });
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<IComplaint | null>(null);

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

  const getEmptyComplaintValues = (): IComplaintFields => ({
    description: "",
    status: COMPLAINT_STATUS_ENUM.Open,
    customerId: undefined,
    complaintTypeId: undefined,
    complaintCategoryId: undefined,
    relatedSoftwareId: undefined,
  });

  const handleResetForm = () => {
    if (id && selectedData) {
      resetFormWithData(selectedData);
      return;
    }
    resetMutationForm(form, getEmptyComplaintValues());
  };

  const resetFormWithData = (data: IComplaint) => {
    if (!data) return;
    reset({
      description: data.description ?? "",
      customerId: data.customer
        ? { label: data.customer.name ?? "", value: data.customer.id ?? "" }
        : undefined,
      complaintTypeId: data.complaintType?.id ?? undefined,
      complaintCategoryId: data.complaintCategory?.id ?? undefined,
      relatedSoftwareId: data.relatedSoftware?.id ?? undefined,
      status: data.status ?? COMPLAINT_STATUS_ENUM.Open,
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

  const handleDataSubmission = async (payload: IComplaint) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateMutation({ id: id, ...payload }).unwrap()
        : await createNewMutation(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Complaint updated successfully."
            : "Complaint created successfully.",
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
      {
        field: toId(data.complaintTypeId),
        message: "Complaint type is required.",
      },
      {
        field: toId(data.complaintCategoryId),
        message: "Complaint category is required.",
      },
      {
        field: toId(data.relatedSoftwareId),
        message: "Related Software is required.",
      },
      { field: toId(data.status), message: "Status is required." },
      { field: data.description, message: "Description is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const payload: IComplaint = cleanPayload({
      ...data,
      customerId: toId(data.customerId),
      complaintTypeId: toId(data.complaintTypeId),
      complaintCategoryId: toId(data.complaintCategoryId),
      relatedSoftwareId: toId(data.relatedSoftwareId),
      status: toId(data.status) ?? COMPLAINT_STATUS_ENUM.Open,
    });

    // console.log(payload);
    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Customer Information",
      icon: <User className="w-4 h-4" />,
      data: [
        {
          label: "Customer",
          value: values?.customerId?.label as string,
          required: true,
        },
      ],
    },
    {
      title: "Complaint Information",
      icon: <Phone className="w-4 h-4" />,
      data: [
        {
          label: "Complaint Type",
          value: toLabel(values?.complaintTypeId),
          required: true,
        },
        {
          label: "Complaint Category",
          value: toLabel(values?.complaintCategoryId),
          required: true,
        },
        {
          label: "Related Software",
          value: toLabel(values?.relatedSoftwareId),
          required: true,
        },
      ],
    },
    {
      title: "Complaint Description",
      icon: <Notebook className="w-4 h-4" />,
      data: [
        { label: "Description", value: values?.description, required: true },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<IComplaintFields>
        form={form}
        pageSummary={{
          title: id ? "Update Complaint" : "Create New Complaint",
          description: `Enter all the details of the complaint you want to ${
            id ? "update" : "create"
          }.`,
          icon: Phone,
        }}
        formContent={
          <ComplaintsFormContent
            form={form}
            isLoading={isLoading}
            isUpdate={!!id}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Complaint - ${selectedData?.complaintCode ?? ""} `
            : "Add Complaint"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Complaint Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Complaint",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default ComplaintsForm;
