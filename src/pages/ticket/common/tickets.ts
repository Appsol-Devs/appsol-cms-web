import type { ICustomer } from "@/pages/customer/common/customers";
import type { IUser } from "@/pages/customer/common/customers";
import type { IComplaint } from "@/pages/complaint/common/complaints";
import { z } from "zod";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

const dropdownOptionSchema = z.object({
  label: z.union([z.string(), z.number()]),
  value: z.string(),
});

export const ticketFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  requestedDate: z.string().min(1, "Requested date is required"),
  notes: z.string().optional(),
  complaintId: dropdownOptionSchema.optional(),
  assignedEngineerId: dropdownOptionSchema.optional(),
  priority: dropdownOptionSchema.optional(),
  status: dropdownOptionSchema.optional(),
});

export type ITicketFormFields = z.infer<typeof ticketFormSchema>;
export type TicketStatus = "open" | "fixed" | "closed" | "assigned" | "rejected";

export interface ITicketComplaint {
  _id?: string;
  customer?: ICustomer;
  description?: string;
  complaintCode?: string;
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
  history?: unknown[];
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
