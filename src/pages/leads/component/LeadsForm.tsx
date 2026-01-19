import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import { Spotlight, Headset, Home, Lock, StepForward } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddLeadMutation,
  useLazyGetALeadQuery,
  useUpdateLeadMutation,
} from "../common/leadsApi";
import type { ILead } from "../common/leads";
import LeadsFormContent from "./LeadsFormContent";
import type { DropDownOption } from "@/components/DropdownComponent";

export type ILeadFields = Omit<ILead, "_id"> & {
  nextStep?: DropDownOption<string>;
  leadStage?: DropDownOption<string>;
  priority?: DropDownOption<string>;
  leadStatus?: DropDownOption<string>;
};

const LeadsForm = () => {
  const { id } = useParams();

  const [createMutation, { isLoading: isCreating }] = useAddLeadMutation();
  const [updateMutation, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [getSelectedData, { isLoading: isGetting }] = useLazyGetALeadQuery();
  const form = useForm<ILeadFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<ILead | null>(null);

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

  const resetFormWithData = (data: ILead) => {
    if (!data) return;
    reset({
      ...data,
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      leadSource: data.leadSource,
      location: data.location,
      notes: data.notes,
      leadStage: data.leadStage
        ? { label: data.leadStage.name ?? "", value: data.leadStage._id ?? "" }
        : undefined,
      nextStep: data.nextStep
        ? { label: data.nextStep.name ?? "", value: data.nextStep._id ?? "" }
        : undefined,
      priority: data.priority
        ? { label: data.priority, value: data.priority }
        : undefined,
      leadStatus: data.leadStatus
        ? { label: data.leadStatus, value: data.leadStatus }
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

  const handleDataSubmission = async (payload: ILead) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateMutation({ _id: id, ...payload }).unwrap()
        : await createMutation(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Customer updated successfully."
            : "Customer created successfully.",
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

    const requiredFields = [
      { field: data.name, message: "Name is required." },
      { field: data.companyName, message: "Company Name is required." },
      { field: data.phone, message: "Phone Number is required." },
      // { field: data.email, message: "Email is required." },
    ];

    for (const { field, message } of requiredFields) {
      //   if (!field && !skip) {
      if (!field) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const payload: ILead = cleanPayload({
      name: data.name,
      companyName: data.companyName,
      //   dateConverted: data.dateConverted,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      location: data.location,
    });

    console.log(payload);
    return;
    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Basic Information",
      icon: <Headset className="w-4 h-4" />,
      data: [
        { label: "Name", value: values?.name, required: true },
        { label: "Email", value: values?.email, required: true },
        {
          label: "Phone Number",
          value: values?.phone,
          required: true,
        },
        {
          label: "Lead Source",
          value: values?.leadSource,
        },
      ],
    },
    {
      title: "Business Information",
      icon: <Home className="w-4 h-4" />,
      data: [
        {
          label: "Company Name",
          value: values?.companyName as string,
          required: true,
        },
        {
          label: "Location",
          value: values?.location as string,
          required: true,
        },
        // {
        //   label: "Date Converted",
        //   value: values?.dateConverted as string,
        // },
      ],
    },
    {
      title: "Negotiation Step",
      icon: <StepForward className="w-4 h-4" />,
      data: [
        {
          label: "Current Stage",
          value: values?.leadStage?.label as string,
          required: true,
        },
        {
          label: "Next Stage",
          value: values?.nextStep?.label as string,
          required: true,
        },
        {
          label: "Notes",
          value: values?.notes as string,
        },
        // {
        //   label: "Date Converted",
        //   value: values?.dateConverted as string,
        // },
      ],
    },
    {
      title: "Status",
      icon: <Lock className="w-4 h-4" />,
      data: [
        {
          label: "Priority",
          value: values?.priority?.label as string,
          required: true,
        },
        {
          label: "Status",
          value: values?.leadStatus?.label as string,
          required: true,
        },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<ILeadFields>
        form={form}
        pageSummary={{
          title: id ? "Update Lead" : "Create New Lead",
          description: `Enter all the details of the lead you want to ${
            id ? "update" : "create"
          }.`,
          icon: Spotlight,
        }}
        formContent={
          <LeadsFormContent isUpdate={!!id} form={form} isLoading={isLoading} />
        }
        submitData={submitData}
        pageTitle={
          id ? `Update Lead - ${selectedData?.companyName ?? ""}` : "Add Lead"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Lead Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Lead",
        }}
      />
    </div>
  );
};

export default LeadsForm;
