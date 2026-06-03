import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, resetMutationForm } from "@/lib/helpers";
import type { DefaultValues } from "react-hook-form";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { IComplaintType } from "../../common/settings";
import {
  useAddComplaintTypeMutation,
  useLazyGetAComplaintTypeQuery,
  useUpdateComplaintTypeMutation,
} from "../../common/settingsApi";
import ComplaintTypesFormContent from "./ComplaintTypesFormContent";

export type IComplaintTypeFields = Omit<IComplaintType, "_id"> & {};

const ComplaintTypesForm = () => {
  const { id } = useParams();

  const [createNewComplaintType, { isLoading: isCreating }] =
    useAddComplaintTypeMutation();
  const [updateComplaintType, { isLoading: isUpdating }] =
    useUpdateComplaintTypeMutation();
  const [getAComplaintType, { isLoading: isGetting }] =
    useLazyGetAComplaintTypeQuery();
  const form = useForm<IComplaintTypeFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedComplaintType, setSelectedComplaintTypes] =
    useState<IComplaintType | null>(null);

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getAComplaintType(id).unwrap();
      if (res) {
        setSelectedComplaintTypes(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getEmptyValues = (): IComplaintTypeFields => ({
    name: "",
    description: "",
    colorCode: undefined,
  });

  const resetFormWithData = (data: IComplaintType) => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      description: data.description ?? "",
      isActive: data.isActive,
      colorCode: data.colorCode,
    });
  };

  const handleResetForm = () => {
    if (id && selectedComplaintType) {
      resetFormWithData(selectedComplaintType);
      return;
    }
    resetMutationForm<IComplaintTypeFields>(
      form,
      getEmptyValues() as DefaultValues<IComplaintTypeFields>,
    );
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedComplaintType) {
      resetFormWithData(selectedComplaintType);
    }
  }, [selectedComplaintType]);

  const handleDataSubmission = async (payload: IComplaintType) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateComplaintType({ _id: id, ...payload }).unwrap()
        : await createNewComplaintType(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Complaint type updated successfully."
            : "Complaint type created successfully.",
          type: "success",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitData = () => {
    const data = getValues();

    // const isUpdate = id ? true : false;

    const requiredFields = [{ field: data.name, message: "Name is required." }];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const payload: IComplaintType = cleanPayload({
      name: data.name,
      description: data.description,
      isActive: id ? data.isActive : undefined,
      colorCode: data.colorCode,
    });

    // console.log(payload);
    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Information",
      icon: <Phone className="w-4 h-4" />,
      data: [
        { label: "Name", value: values?.name, required: true },
        { label: "Description", value: values?.description },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<IComplaintTypeFields>
        form={form}
        pageSummary={{
          title: id ? "Update Complaint Type" : "Create New Complaint Type",
          description: `Enter all the details of the complaint type you want to ${
            id ? "update" : "create"
          }.`,
          icon: Phone,
        }}
        formContent={
          <ComplaintTypesFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Complaint Type - ${selectedComplaintType?.name ?? ""} `
            : "Add Complaint Type"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Complaint Type Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Complaint Type",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default ComplaintTypesForm;
