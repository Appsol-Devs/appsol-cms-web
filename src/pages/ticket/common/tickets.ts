import type { ICustomer } from "@/pages/customer/common/customers";
import type { IUser } from "@/pages/customer/common/customers";
import type { IComplaint } from "@/pages/complaint/common/complaints";
import { z } from "zod";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

const dropdownOptionSchema = z.object({
  label: z.union([z.string(), z.number()]),
  value: z.string(),
});

const formDropdownFieldSchema = z.union([z.string(), dropdownOptionSchema]);

export const ticketFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  requestedDate: z.string().min(1, "Requested date and time is required"),
  notes: z.string().optional(),
  complaintId: z
    .union([
      z.undefined(),
      z.object({
        label: z.union([z.string(), z.number()]),
        value: z.union([z.string(), z.record(z.string(), z.any())]),
      }),
    ])
    .refine((v) => {
      if (v == null) return false;
      const val = (v as { value?: string | { _id?: string } }).value;
      return typeof val === "string" ? !!val?.trim() : !!val?._id;
    }, { message: "Complaint is required" }),
  assignedEngineerId: formDropdownFieldSchema.optional(),
  priority: formDropdownFieldSchema.optional(),
  status: formDropdownFieldSchema.optional(),
});

export const ticketFieldToId = (
  val?: string | z.infer<typeof dropdownOptionSchema> | null,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.value;
};

export const ticketFieldToLabel = (
  val?: string | z.infer<typeof dropdownOptionSchema> | null,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.label?.toString();
};

export const buildComplaintFormOption = (complaint: IComplaint) => ({
  label: `${complaint.complaintCode ?? "—"} - ${complaint.customer?.name ?? "Unknown"}`,
  value: complaint,
});

export const ticketComplaintToId = (
  complaint?: ITicketFormFields["complaintId"],
): string | undefined => {
  if (!complaint) return undefined;
  const rawValue = complaint.value;
  if (typeof rawValue === "string") return rawValue;
  return rawValue?._id;
};

export const ticketComplaintToLabel = (
  complaint?: ITicketFormFields["complaintId"],
  fallback?: IComplaint | null,
): string | undefined => {
  if (complaint?.label != null && complaint.label !== "") {
    return String(complaint.label);
  }
  if (fallback) return buildComplaintFormOption(fallback).label;
  const id = ticketComplaintToId(complaint);
  return id ? id : undefined;
};

export type ITicketFormFields = z.infer<typeof ticketFormSchema>;
export type TicketStatus = "open" | "fixed" | "closed" | "assigned" | "rejected";

export interface ITicketComplaint {
  _id?: string;
  customer?: ICustomer;
  description?: string;
  complaintCode?: string;
}

export interface ITicketHistoryEntry {
  _id?: string;
  from?: string | IUser | null;
  to?: string | IUser | null;
  date?: string;
  reason?: string;
  createdAt?: string;
}

export interface ITicket {
  _id?: string;
  ticketCode?: string;
  title?: string;
  requestedDate?: string;
  notes?: string;
  complaintId?: string;
  complaint?: ITicketComplaint | IComplaint;
  assignedEngineerId?: string;
  assignedEngineer?: IUser;
  priority?: TicketPriority;
  status?: TicketStatus;
  loggedBy?: IUser;
  history?: ITicketHistoryEntry[];
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateTicketPayload {
  title: string;
  requestedDate: string;
  notes?: string;
  complaintId: string;
  assignedEngineerId?: string;
  priority?: TicketPriority;
  status?: string;
}

export interface IReassignTicketPayload {
  from: string;
  to: string;
  reason: string;
}
