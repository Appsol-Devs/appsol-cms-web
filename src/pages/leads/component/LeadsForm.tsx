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

export type ILeadFields = Omit<ILead, "_id" | "leadStage" | "nextStep"> & {
  nextStep?: DropDownOption<string>;
  leadStage?: DropDownOption<string>;
  software?: DropDownOption<string>;
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
      initialEnquiryDate: data.initialEnquiryDate,
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
      software: data.softwareId
        ? {
            label: data.software?.name ?? "",
            value: data.softwareId,
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
            ? "Lead updated successfully."
            : "Lead created successfully.",
          type: "success",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
      showToast({
        title: "Error",
        message: id ? "Failed to update lead." : "Failed to create lead.",
        type: "error",
      });
    }
  };

  const submitData = () => {
    const data = getValues();
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";

    const requiredFields: { field: unknown; message: string }[] = [
      { field: data.name, message: "Name is required." },
      { field: data.email, message: "Email is required." },
      { field: data.companyName, message: "Company Name is required." },
      { field: data.leadSource, message: "Lead Source is required." },
      { field: data.software?.value, message: "Software is required." },
      { field: data.initialEnquiryDate, message: "Initial Enquiry Date is required." },
      { field: data.nextStep?.value, message: "Next Step is required." },
      { field: data.leadStatus?.value, message: "Lead Status is required." },
      { field: data.priority?.value, message: "Priority is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Validation", message, type: "info", duration: 2000 });
        return;
      }
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (data.email && !emailRegex.test(data.email)) {
      showToast({
        title: "Validation",
        message: "Please enter a valid email address.",
        type: "info",
        duration: 2000,
      });
      return;
    }

    if (phone.length < 10 || phone.length > 13) {
      showToast({
        title: "Validation",
        message: "Phone number must be between 10 and 13 characters.",
        type: "info",
        duration: 2000,
      });
      return;
    }

    const payload: ILead = cleanPayload({
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      location: data.location,
      leadSource: data.leadSource,
      softwareId: data.software?.value,
      initialEnquiryDate: data.initialEnquiryDate,
      leadStage: data.leadStage?.value,
      nextStep: data.nextStep?.value,
      priority: data.priority?.value,
      leadStatus: data.leadStatus?.value,
    });

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
          required: true,
        },
        {
          label: "Software",
          value: values?.software?.label as string,
          required: true,
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
          required: false,
        },
        {
          label: "Initial Enquiry Date",
          value: values?.initialEnquiryDate as string,
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
          required: false,
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
