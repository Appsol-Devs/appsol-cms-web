import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, formatMutationSummaryDateTime } from "@/lib/helpers";
import { Spotlight, Headset, Home, Lock, StepForward } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddLeadMutation,
  useLazyGetALeadQuery,
  useUpdateLeadMutation,
} from "../common/leadsApi";
import {
  leadFieldToId,
  leadFieldToLabel,
  type ILead,
  type LeadFormDropdownValue,
} from "../common/leads";
import LeadsFormContent from "./LeadsFormContent";
import { LEAD_PRIORITY_ENUM, LEAD_STATUS_ENUM } from "@/lib/enums";

export type ILeadFields = Omit<
  ILead,
  "_id" | "leadStage" | "nextStep" | "software"
> & {
  nextStep?: LeadFormDropdownValue;
  leadStage?: LeadFormDropdownValue;
  software?: LeadFormDropdownValue;
  priority?: LeadFormDropdownValue;
  leadStatus?: LeadFormDropdownValue;
};

const LeadsForm = () => {
  const { id } = useParams();

  const [createMutation, { isLoading: isCreating }] = useAddLeadMutation();
  const [updateMutation, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [getSelectedData, { isLoading: isGetting }] = useLazyGetALeadQuery();
  const form = useForm<ILeadFields>({
    defaultValues: {
      priority: LEAD_PRIORITY_ENUM.MEDIUM,
      leadStatus: LEAD_STATUS_ENUM.NEW,
    },
  });
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

    const softwareId =
      typeof data.softwareId === "string"
        ? data.softwareId
        : data.software?._id;

    reset({
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      companyName: data.companyName ?? "",
      leadSource: data.leadSource ?? "",
      location: data.location ?? "",
      notes: data.notes ?? "",
      initialEnquiryDate: data.initialEnquiryDate ?? "",
      leadStage: data.leadStage?._id ?? undefined,
      nextStep: data.nextStep?._id ?? undefined,
      priority: data.priority ?? undefined,
      leadStatus: data.leadStatus ?? undefined,
      software: softwareId ?? undefined,
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

  const trim = (v: unknown) =>
    typeof v === "string" ? v.trim() : v;

  const submitData = () => {
    const data = getValues();
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";

    const requiredFields: { field: unknown; message: string }[] = [
      { field: trim(data.name), message: "Name is required." },
      { field: trim(data.email), message: "Email is required." },
      { field: trim(data.companyName), message: "Company Name is required." },
      { field: trim(data.leadSource), message: "Lead Source is required." },
      {
        field: leadFieldToId(data.software),
        message: "Software is required.",
      },
      { field: data.initialEnquiryDate, message: "Initial Enquiry Date is required." },
      {
        field: leadFieldToId(data.nextStep),
        message: "Next Step is required.",
      },
      {
        field: leadFieldToId(data.leadStatus),
        message: "Lead Status is required.",
      },
      {
        field: leadFieldToId(data.priority),
        message: "Priority is required.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Validation", message, type: "info", duration: 2000 });
        return;
      }
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const emailTrimmed = trim(data.email);
    if (typeof emailTrimmed === "string" && emailTrimmed && !emailRegex.test(emailTrimmed)) {
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

    const shouldSendLeadStatus = !selectedData?.isConverted;
    const leadStatusValue = leadFieldToId(data.leadStatus);

    const payload: ILead = cleanPayload({
      name: trim(data.name),
      companyName: trim(data.companyName),
      email: trim(data.email),
      phone: trim(data.phone),
      notes: trim(data.notes),
      location: trim(data.location),
      leadSource: trim(data.leadSource),
      softwareId: leadFieldToId(data.software),
      initialEnquiryDate: data.initialEnquiryDate,
      leadStage: leadFieldToId(data.leadStage),
      nextStep: leadFieldToId(data.nextStep),
      priority: leadFieldToId(data.priority),
      ...(shouldSendLeadStatus &&
        leadStatusValue && { leadStatus: leadStatusValue }),
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
          value: leadFieldToLabel(values?.software),
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
          value: formatMutationSummaryDateTime(values?.initialEnquiryDate),
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
          value: leadFieldToLabel(values?.leadStage),
          required: false,
        },
        {
          label: "Next Stage",
          value: leadFieldToLabel(values?.nextStep),
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
          value: leadFieldToLabel(values?.priority),
          required: true,
        },
        {
          label: "Status",
          value: leadFieldToLabel(values?.leadStatus),
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
          <LeadsFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
            isConverted={selectedData?.isConverted}
          />
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
