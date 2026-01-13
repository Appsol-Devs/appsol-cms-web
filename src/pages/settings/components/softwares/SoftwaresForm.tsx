import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import { Computer } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddSoftwareMutation,
  useLazyGetASoftwareQuery,
  useUpdateSoftwareMutation,
} from "../../common/settingsApi";
import type { ISoftware } from "../../common/settings";
import SoftwaresFormContent from "./SoftwaresFormContent";

export type ISoftwareFields = Omit<ISoftware, "_id"> & {};

const SoftwaresForm = () => {
  const { id } = useParams();

  const [createNewSoftware, { isLoading: isCreating }] =
    useAddSoftwareMutation();
  const [updateSoftware, { isLoading: isUpdating }] =
    useUpdateSoftwareMutation();
  const [getASoftware, { isLoading: isGetting }] = useLazyGetASoftwareQuery();
  const form = useForm<ISoftwareFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedSoftware, setSelectedSoftware] = useState<ISoftware | null>(
    null
  );

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getASoftware(id).unwrap();
      if (res) {
        setSelectedSoftware(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetFormWithData = (data: ISoftware) => {
    if (!data) return;
    reset({
      ...data,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      colorCode: data.colorCode,
    });
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedSoftware) {
      resetFormWithData(selectedSoftware);
    }
  }, [selectedSoftware]);

  const handleDataSubmission = async (payload: ISoftware) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateSoftware({ _id: id, ...payload }).unwrap()
        : await createNewSoftware(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Software updated successfully."
            : "Software created successfully.",
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

    const payload: ISoftware = cleanPayload({
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
      icon: <Computer className="w-4 h-4" />,
      data: [
        { label: "Name", value: values?.name, required: true },
        { label: "Description", value: values?.description },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<ISoftwareFields>
        form={form}
        pageSummary={{
          title: id ? "Update Software" : "Create New Software",
          description: `Enter all the details of the software you want to ${
            id ? "update" : "create"
          }.`,
          icon: Computer,
        }}
        formContent={
          <SoftwaresFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Software - ${selectedSoftware?.name ?? ""} `
            : "Add Software"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Software Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Software",
        }}
      />
    </div>
  );
};

export default SoftwaresForm;
