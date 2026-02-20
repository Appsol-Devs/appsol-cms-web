import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import { Phone, Notebook, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { IComplaint } from "../common/complaints";
import {
  useAddComplaintMutation,
  useLazyGetAComplaintQuery,
  useUpdateComplaintMutation,
} from "../common/complaintsApi";
import type { DropDownOption } from "@/components/DropdownComponent";
import ComplaintsFormContent from "./ComplaintsFormContent";

export type IComplaintFields = Omit<IComplaint, "_id"> & {
  customerId?: DropDownOption<string>;
  complaintTypeId?: DropDownOption<string>;
  complaintCategoryId?: DropDownOption<string>;
  relatedSoftwareId?: DropDownOption<string>;
  status?: DropDownOption<string>;
};

const ComplaintsForm = () => {
  const { id } = useParams();

  const [createNewMutation, { isLoading: isCreating }] =
    useAddComplaintMutation();
  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateComplaintMutation();
  const [getSelectedData, { isLoading: isGetting }] =
    useLazyGetAComplaintQuery();
  const form = useForm<IComplaintFields>();
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

  const resetFormWithData = (data: IComplaint) => {
    if (!data) return;

    const mapStatusToLabel = (status?: string): string => {
      switch (status) {
        case "open":
          return "Open";
        case "in-progress":
          return "In Progress";
        case "resolved":
          return "Resolved";
        case "closed":
          return "Closed";
        case "rescheduled":
          return "Rescheduled";
        default:
          return status ?? "";
      }
    };

    reset({
      ...data,
      customerId: data.customerId
        ? {
            value: data.customerId,
            label: data.customer?.name ?? "",
          }
        : undefined,
      complaintTypeId: data.complaintTypeId
        ? {
            value: data.complaintTypeId,
            label: data.complaintType?.name ?? "",
          }
        : undefined,
      complaintCategoryId: data.complaintCategoryId
        ? {
            value: data.complaintCategoryId,
            label: data.complaintCategory?.name ?? "",
          }
        : undefined,
      relatedSoftwareId: data.relatedSoftwareId
        ? {
            value: data.relatedSoftwareId,
            label: data.relatedSoftware?.name ?? "",
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

  const handleDataSubmission = async (payload: IComplaint) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateMutation({ _id: id, ...payload }).unwrap()
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
      { field: data.complaintTypeId, message: "Complaint type is required." },
      {
        field: data.complaintCategoryId,
        message: "Complaint category is required.",
      },
      {
        field: data.relatedSoftwareId,
        message: "Related Software is required.",
      },
      { field: data.description, message: "Description is required." },
      { field: data.status?.value, message: "Status is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Validation", message, type: "info", duration: 2000 });
        return;
      }
    }

    const payload: IComplaint = cleanPayload({
      ...data,
      customerId: data.customerId?.value,
      complaintTypeId: data.complaintTypeId?.value,
      complaintCategoryId: data.complaintCategoryId?.value,
      relatedSoftwareId: data.relatedSoftwareId?.value,
      status: data.status?.value,
      //   isActive: id ? data.isActive : undefined,
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
          value: values?.complaintTypeId?.label as string,
          required: true,
        },
        {
          label: "Complaint Category",
          value: values?.complaintCategoryId?.label as string,
          required: true,
        },
        {
          label: "Related Software",
          value: values?.relatedSoftwareId?.label as string,
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
      />
    </div>
  );
};

export default ComplaintsForm;
