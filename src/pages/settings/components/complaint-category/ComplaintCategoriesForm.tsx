import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, resetMutationForm } from "@/lib/helpers";
import type { DefaultValues } from "react-hook-form";
import { Headset } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { IComplaintCategory } from "../../common/settings";
import {
  useAddComplaintCategoryMutation,
  useLazyGetAComplaintCategoryQuery,
  useUpdateComplaintCategoryMutation,
} from "../../common/settingsApi";
import ComplaintCategoriesFormContent from "./ComplaintCategoriesFormContent";

export type IComplaintCategoryFields = Omit<IComplaintCategory, "_id"> & {};

const ComplaintCategoriesForm = () => {
  const { id } = useParams();

  const [createNewMutation, { isLoading: isCreating }] =
    useAddComplaintCategoryMutation();
  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateComplaintCategoryMutation();
  const [getSelectedData, { isLoading: isGetting }] =
    useLazyGetAComplaintCategoryQuery();
  const form = useForm<IComplaintCategoryFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<IComplaintCategory | null>(
    null
  );

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getSelectedData(id).unwrap();
      if (res) {
        setSelectedData(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getEmptyValues = (): IComplaintCategoryFields => ({
    name: "",
    description: "",
    colorCode: undefined,
  });

  const resetFormWithData = (data: IComplaintCategory) => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      description: data.description ?? "",
      isActive: data.isActive,
      colorCode: data.colorCode,
    });
  };

  const handleResetForm = () => {
    if (id && selectedData) {
      resetFormWithData(selectedData);
      return;
    }
    resetMutationForm<IComplaintCategoryFields>(
      form,
      getEmptyValues() as DefaultValues<IComplaintCategoryFields>,
    );
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

  const handleDataSubmission = async (payload: IComplaintCategory) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateMutation({ _id: id, ...payload }).unwrap()
        : await createNewMutation(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Complaint category updated successfully."
            : "Complaint category created successfully.",
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

    const payload: IComplaintCategory = cleanPayload({
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
      icon: <Headset className="w-4 h-4" />,
      data: [
        { label: "Name", value: values?.name, required: true },
        { label: "Description", value: values?.description },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<IComplaintCategoryFields>
        form={form}
        pageSummary={{
          title: id
            ? "Update Complaint Category"
            : "Create New Complaint Category",
          description: `Enter all the details of the complaint category you want to ${
            id ? "update" : "create"
          }.`,
          icon: Headset,
        }}
        formContent={
          <ComplaintCategoriesFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Complaint Category - ${selectedData?.name ?? ""} `
            : "Add Complaint Category"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Complaint Category Details Summary",
          summarySaveButtonText: id
            ? "Save Changes"
            : "Save Complaint Category",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default ComplaintCategoriesForm;
