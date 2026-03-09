import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import { Ticket, Notebook } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { allRoutes } from "@/utils/routes";
import {
  ticketFormSchema,
  type ICreateTicketPayload,
  type ITicketFormFields,
  type ITicket,
} from "../common/tickets";
import {
  useAddTicketMutation,
  useLazyGetATicketQuery,
  useUpdateTicketMutation,
} from "../common/ticketsApi";
import type { IComplaint } from "@/pages/complaint/common/complaints";
import TicketFormContent from "./TicketFormContent";

const TicketForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const fromComplaint = location.state as
    | { complaint?: IComplaint; complaintId?: string }
    | null;
  const prefillComplaint = fromComplaint?.complaint ?? null;
  const prefillComplaintId = fromComplaint?.complaintId ?? prefillComplaint?._id ?? undefined;

  const [addTicket, { isLoading: isCreating }] = useAddTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const [getTicket, { isLoading: isGetting }] = useLazyGetATicketQuery();
  const form = useForm<ITicketFormFields>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      requestedDate: "",
      notes: "",
      complaintId: prefillComplaintId
        ? {
            value: prefillComplaintId,
            label:
              prefillComplaint
                ? `${prefillComplaint.complaintCode ?? ""} - ${prefillComplaint.customer?.name ?? ""}`
                : prefillComplaintId,
          }
        : undefined,
    },
  });
  const { watch, handleSubmit, reset, setValue } = form;
  const values = watch();
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);

  useEffect(() => {
    if (prefillComplaintId) {
      setValue("complaintId", {
        value: prefillComplaintId,
        label: prefillComplaint
          ? `${prefillComplaint.complaintCode ?? ""} - ${prefillComplaint.customer?.name ?? ""}`
          : prefillComplaintId,
      });
    }
  }, [prefillComplaintId, prefillComplaint, setValue]);

  useEffect(() => {
    if (!id) return;

    getTicket(id)
      .unwrap()
      .then((res) => {
        if (res) {
          setSelectedTicket(res);
          reset({
            title: res.title ?? "",
            requestedDate: res.requestedDate ?? "",
            notes: res.notes ?? "",
            complaintId: res.complaint
              ? {
                  label:
                    res.complaint.complaintCode ??
                    res.complaint.customer?.name ??
                    "",
                  value: res.complaintId ?? res.complaint._id ?? "",
                }
              : undefined,
            assignedEngineerId: res.assignedEngineer
              ? {
                  label: `${res.assignedEngineer.firstName ?? ""} ${
                    res.assignedEngineer.lastName ?? ""
                  } (${res.assignedEngineer.email ?? ""})`.trim(),
                  value:
                    res.assignedEngineer._id ?? res.assignedEngineerId ?? "",
                }
              : undefined,
            priority: res.priority
              ? { label: res.priority, value: res.priority }
              : undefined,
            status: res.status
              ? { label: res.status, value: res.status }
              : undefined,
          });
        }
      })
      .catch((err) => console.error("Failed to fetch ticket", err));
  }, [id, getTicket, reset]);

  const handleDataSubmission = async (payload: ICreateTicketPayload) => {
    if (!payload) return;
    try {
      const isEdit = !!id;
      const res = isEdit
        ? await updateTicket({
            _id: id as string,
            ...payload,
          }).unwrap()
        : await addTicket(payload).unwrap();
      if (res) {
        showToast({
          title: "Success",
          message: isEdit
            ? "Ticket updated successfully."
            : "Ticket created successfully.",
          type: "success",
        });
        navigate(allRoutes.PORTAL + allRoutes.TICKETS);
      }
    } catch (error) {
      if (!error) return;
    }
  };

  const submitData = handleSubmit((data) => {
    const complaintId = data.complaintId?.value ?? prefillComplaintId;
    if (!complaintId) {
      showToast({
        title: "Info",
        message: "Complaint is required.",
        type: "info",
        duration: 1000,
      });
      return;
    }

    const payload = cleanPayload({
      title: data.title.trim(),
      requestedDate: data.requestedDate,
      notes: data.notes?.trim() || undefined,
      complaintId,
      assignedEngineerId: data.assignedEngineerId?.value,
      priority: data.priority?.value as ICreateTicketPayload["priority"],
      status: (data.status?.value as string) ?? "open",
    }) as ICreateTicketPayload;

    handleDataSubmission(payload);
  });

  const summarySections: ISummarySection[] = [
    {
      title: "Ticket Summary",
      icon: <Ticket className="w-4 h-4" />,
      data: [
        { label: "Title", value: values?.title, required: true },
        {
          label: "Requested Date",
          value: values?.requestedDate
            ? new Date(values.requestedDate).toLocaleString()
            : "",
          required: true,
        },
        {
          label: "Complaint",
          value: String(values?.complaintId?.label ?? (prefillComplaint ? `${prefillComplaint.complaintCode} - ${prefillComplaint.customer?.name}` : "")),
          required: true,
        },
        {
          label: "Assigned Engineer",
          value: String(values?.assignedEngineerId?.label ?? ""),
          required: false,
        },
        {
          label: "Priority",
          value: String(values?.priority?.label ?? ""),
          required: false,
        },
        {
          label: "Status",
          value: String(values?.status?.label ?? ""),
          required: false,
        },
      ],
    },
    {
      title: "Notes",
      icon: <Notebook className="w-4 h-4" />,
      data: [{ label: "Notes", value: values?.notes, required: false }],
    },
  ];

  return (
    <div>
      <MutationFormTemplate<ITicketFormFields>
        form={form}
        pageSummary={{
          title: id ? "Update Ticket" : "Create New Ticket",
          description: `Enter ticket details. Tickets can be raised from complaints or explicitly.`,
          icon: Ticket,
        }}
        formContent={
          <TicketFormContent
            form={form}
            isLoading={isCreating}
            prefillComplaintId={prefillComplaintId}
            prefillComplaint={prefillComplaint}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Ticket - ${selectedTicket?.ticketCode ?? ""}`
            : "Create Ticket"
        }
        loading={isCreating || isUpdating || isGetting}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Ticket Summary",
          summarySaveButtonText: id ? "Save Changes" : "Create Ticket",
        }}
      />
    </div>
  );
};

export default TicketForm;
