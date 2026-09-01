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
  useAddLeadNextStepMutation,
  useLazyGetALeadNextStepQuery,
  useUpdateLeadNextStepMutation,
} from "../../common/settingsApi";
import type { ILeadNextStep } from "../../common/settings";
import LeadNextStepsFormContent from "./LeadNextStepsFormContent";

export type ILeadNextStepFields = Omit<ILeadNextStep, "id"> & {};

const LeadNextStepsForm = () => {
  const { id } = useParams();

  const [createNewLeadNextStep, { isLoading: isCreating }] =
    useAddLeadNextStepMutation();
  const [updateLeadNextStep, { isLoading: isUpdating }] =
    useUpdateLeadNextStepMutation();
  const [getALeadNextStep, { isLoading: isGetting }] =
    useLazyGetALeadNextStepQuery();
  const form = useForm<ILeadNextStepFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedLeadNextStep, setSelectedLeadNextStep] =
    useState<ILeadNextStep | null>(null);

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getALeadNextStep(id).unwrap();
      if (res) {
        setSelectedLeadNextStep(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getEmptyValues = (): ILeadNextStepFields => ({
    name: "",
    description: "",
    colorCode: undefined,
  });

  const resetFormWithData = (data: ILeadNextStep) => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      description: data.description ?? "",
      isActive: data.isActive,
      colorCode: data.colorCode,
    });
  };

  const handleResetForm = () => {
    if (id && selectedLeadNextStep) {
      resetFormWithData(selectedLeadNextStep);
      return;
    }
    resetMutationForm<ILeadNextStepFields>(
      form,
      getEmptyValues() as DefaultValues<ILeadNextStepFields>,
    );
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedLeadNextStep) {
      resetFormWithData(selectedLeadNextStep);
    }
  }, [selectedLeadNextStep]);

  const handleDataSubmission = async (payload: ILeadNextStep) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateLeadNextStep({ id: id, ...payload }).unwrap()
        : await createNewLeadNextStep(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Lead Next Step updated successfully."
            : "Lead Next Step created successfully.",
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

    const payload: ILeadNextStep = cleanPayload({
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
      <MutationFormTemplate<ILeadNextStepFields>
        form={form}
        pageSummary={{
          title: id ? "Update Lead Next Step" : "Create New Lead Next Step",
          description: `Enter all the details of the lead next step you want to ${
            id ? "update" : "create"
          }.`,
          icon: Computer,
        }}
        formContent={
          <LeadNextStepsFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Lead Next Step - ${selectedLeadNextStep?.name ?? ""} `
            : "Add Lead Next Step"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Lead Next Step Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Lead Next Step",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default LeadNextStepsForm;
