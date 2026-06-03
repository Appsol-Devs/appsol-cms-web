import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, resetMutationForm } from "@/lib/helpers";
import type { DefaultValues } from "react-hook-form";
import { Computer } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddSetupStatusMutation,
  useLazyGetASetupStatusQuery,
  useUpdateSetupStatusMutation,
} from "../../common/settingsApi";
import type { ISetupStatus } from "../../common/settings";
import SetupStatuesFormContent from "./SetupStatusesFormContent";

export type ISetupStatusFields = Omit<ISetupStatus, "_id"> & {};

const SetupStatusesForm = () => {
  const { id } = useParams();

  const [createNewSetupStatus, { isLoading: isCreating }] =
    useAddSetupStatusMutation();
  const [updateSetupStatus, { isLoading: isUpdating }] =
    useUpdateSetupStatusMutation();
  const [getASetupStatus, { isLoading: isGetting }] = useLazyGetASetupStatusQuery();
  const form = useForm<ISetupStatusFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedSetupStatus, setSelectedSetupStatus] = useState<ISetupStatus | null>(
    null
  );

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getASetupStatus(id).unwrap();
      if (res) {
        setSelectedSetupStatus(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getEmptyValues = (): ISetupStatusFields => ({
    name: "",
    description: "",
    colorCode: undefined,
  });

  const resetFormWithData = (data: ISetupStatus) => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      description: data.description ?? "",
      isActive: data.isActive,
      colorCode: data.colorCode,
    });
  };

  const handleResetForm = () => {
    if (id && selectedSetupStatus) {
      resetFormWithData(selectedSetupStatus);
      return;
    }
    resetMutationForm<ISetupStatusFields>(
      form,
      getEmptyValues() as DefaultValues<ISetupStatusFields>,
    );
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedSetupStatus) {
      resetFormWithData(selectedSetupStatus);
    }
  }, [selectedSetupStatus]);

  const handleDataSubmission = async (payload: ISetupStatus) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateSetupStatus({ _id: id, ...payload }).unwrap()
        : await createNewSetupStatus(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Setup Status updated successfully."
            : "Setup Status created successfully.",
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

    const payload: ISetupStatus = cleanPayload({
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
      <MutationFormTemplate<ISetupStatusFields>
        form={form}
        pageSummary={{
          title: id ? "Update Setup Status" : "Create New Setup Status",
          description: `Enter all the details of the setup status you want to ${
            id ? "update" : "create"
          }.`,
          icon: Computer,
        }}
        formContent={
          <SetupStatuesFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Setup Status - ${selectedSetupStatus?.name ?? ""} `
            : "Add Setup Status"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Setup Status Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Setup Status",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default SetupStatusesForm;
