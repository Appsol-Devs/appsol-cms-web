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
  useAddLeadStatusMutation,
  useLazyGetALeadStatusQuery,
  useUpdateLeadStatusMutation,
} from "../../common/settingsApi";
import type { ILeadStatus } from "../../common/settings";
import LeadStatusesFormContent from "./LeadStatusesFormContent";

export type ILeadStatusFields = Omit<ILeadStatus, "id"> & {};

const LeadStatusesForm = () => {
  const { id } = useParams();

  const [createNewLeadStatus, { isLoading: isCreating }] =
    useAddLeadStatusMutation();
  const [updateLeadStatus, { isLoading: isUpdating }] =
    useUpdateLeadStatusMutation();
  const [getALeadStatus, { isLoading: isGetting }] =
    useLazyGetALeadStatusQuery();
  const form = useForm<ILeadStatusFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedLeadStatus, setSelectedLeadStatus] =
    useState<ILeadStatus | null>(null);

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getALeadStatus(id).unwrap();
      if (res) {
        setSelectedLeadStatus(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getEmptyValues = (): ILeadStatusFields => ({
    name: "",
    description: "",
    colorCode: undefined,
  });

  const resetFormWithData = (data: ILeadStatus) => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      description: data.description ?? "",
      isActive: data.isActive,
      colorCode: data.colorCode,
    });
  };

  const handleResetForm = () => {
    if (id && selectedLeadStatus) {
      resetFormWithData(selectedLeadStatus);
      return;
    }
    resetMutationForm<ILeadStatusFields>(
      form,
      getEmptyValues() as DefaultValues<ILeadStatusFields>,
    );
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedLeadStatus) {
      resetFormWithData(selectedLeadStatus);
    }
  }, [selectedLeadStatus]);

  const handleDataSubmission = async (payload: ILeadStatus) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateLeadStatus({ id: id, ...payload }).unwrap()
        : await createNewLeadStatus(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Lead Status updated successfully."
            : "Lead Status created successfully.",
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

    const payload: ILeadStatus = cleanPayload({
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
      <MutationFormTemplate<ILeadStatusFields>
        form={form}
        pageSummary={{
          title: id ? "Update Lead Status" : "Create New Lead Status",
          description: `Enter all the details of the lead status you want to ${
            id ? "update" : "create"
          }.`,
          icon: Computer,
        }}
        formContent={
          <LeadStatusesFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Lead Status - ${selectedLeadStatus?.name ?? ""} `
            : "Add Lead Status"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Lead Status Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Lead Status",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default LeadStatusesForm;
