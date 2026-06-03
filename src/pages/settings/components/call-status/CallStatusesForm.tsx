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
  useAddCallStatusMutation,
  useLazyGetACallStatusQuery,
  useUpdateCallStatusMutation,
} from "../../common/settingsApi";
import type { ICallStatus } from "../../common/settings";
import CallStatusesFormContent from "./CallStatusesFormContent";

export type ICallStatusFields = Omit<ICallStatus, "_id"> & {};

const CallStatusesForm = () => {
  const { id } = useParams();

  const [createNewCallStatus, { isLoading: isCreating }] =
    useAddCallStatusMutation();
  const [updateCallStatus, { isLoading: isUpdating }] =
    useUpdateCallStatusMutation();
  const [getACallStatus, { isLoading: isGetting }] = useLazyGetACallStatusQuery();
  const form = useForm<ICallStatusFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedCallStatus, setSelectedCallStatus] = useState<ICallStatus | null>(
    null
  );

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getACallStatus(id).unwrap();
      if (res) {
        setSelectedCallStatus(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getEmptyValues = (): ICallStatusFields => ({
    name: "",
    description: "",
    colorCode: undefined,
    isFinal: undefined,
  });

  const resetFormWithData = (data: ICallStatus) => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      description: data.description ?? "",
      isActive: data.isActive,
      isFinal: data.isFinal,
      colorCode: data.colorCode,
    });
  };

  const handleResetForm = () => {
    if (id && selectedCallStatus) {
      resetFormWithData(selectedCallStatus);
      return;
    }
    resetMutationForm<ICallStatusFields>(
      form,
      getEmptyValues() as DefaultValues<ICallStatusFields>,
    );
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedCallStatus) {
      resetFormWithData(selectedCallStatus);
    }
  }, [selectedCallStatus]);

  const handleDataSubmission = async (payload: ICallStatus) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateCallStatus({ _id: id, ...payload }).unwrap()
        : await createNewCallStatus(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Call Status updated successfully."
            : "Call Status created successfully.",
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

    const payload: ICallStatus = cleanPayload({
      name: data.name,
      description: data.description,
      isActive: id ? data.isActive : undefined,
      isFinal: id ? data.isFinal : undefined,
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
      <MutationFormTemplate<ICallStatusFields>
        form={form}
        pageSummary={{
          title: id ? "Update Call Status" : "Create New Call Status",
          description: `Enter all the details of the call status you want to ${
            id ? "update" : "create"
          }.`,
          icon: Computer,
        }}
        formContent={
          <CallStatusesFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Call Status - ${selectedCallStatus?.name ?? ""} `
            : "Add Call Status"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Call Status Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Call Status",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default CallStatusesForm;
