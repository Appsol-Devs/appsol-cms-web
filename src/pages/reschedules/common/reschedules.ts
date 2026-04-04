import type { DropDownOption } from "@/components/DropdownComponent";
import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import type { ICustomerOutreach } from "@/pages/customer-outreaches/common/customer-outreach";
import type { IComplaint } from "@/pages/complaint/common/complaints";
import type { ITicket } from "@/pages/ticket/common/tickets";
import type { ISubscription } from "@/pages/subscriptions/common/subscriptions";

export type TargetEntityType =
  | "CustomerSetup"
  | "Generic"
  | "Ticket"
  | "CustomerOutreach"
  | "CustomerComplaint"
  | "SubscriptionReminder";

export type RescheduleStatus = "pending" | "approved" | "rejected";

export interface IReschedule {
  _id?: string;
  rescheduleCode?: string;
  colorCode?: string;
  reason?: string;
  title?: string;

  targetEntityId?: string;
  targetEntity?:
    | ICustomerOutreach
    | IComplaint
    | ITicket
    | ISubscription
    | string;

  customer?: ICustomer | string;
  customerId?: string;

  originalDateTime?: string;
  newDateTime?: string;
  from?: string;
  to?: string;

  targetEntityType?: TargetEntityType;

  status?: RescheduleStatus;

  loggedBy?: IUser | string;

  createdAt?: string;
  updatedAt?: string;
}

export type ICreateReschedulePayload = Omit<
  IReschedule,
  "_id" | "rescheduleCode" | "createdAt" | "updatedAt" | "customer" | "targetEntity" | "loggedBy"
>;

export type IRescheduleFormFields = Omit<
  IReschedule,
  "_id" | "customer" | "targetEntity" | "loggedBy" | "status" | "targetEntityType"
> & {
  customerId?: DropDownOption<ICustomer>;
  targetEntityType?: DropDownOption<TargetEntityType>;
  status?: DropDownOption<RescheduleStatus>;
};

export function parseRescheduleDate(iso?: string | null): Date | null {
  if (iso == null || String(iso).trim() === "") return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getScheduleStart(res: IReschedule): Date | null {
  return parseRescheduleDate(res.from) ?? parseRescheduleDate(res.newDateTime);
}

export function getScheduleEnd(res: IReschedule): Date | null {
  return (
    parseRescheduleDate(res.to) ??
    parseRescheduleDate(res.newDateTime) ??
    parseRescheduleDate(res.from)
  );
}

export function getScheduleInterval(
  res: IReschedule,
): { start: Date; end: Date } | null {
  const a = getScheduleStart(res);
  if (!a) return null;
  const b = getScheduleEnd(res) ?? a;
  const start = a.getTime() <= b.getTime() ? a : b;
  const end = a.getTime() <= b.getTime() ? b : a;
  return { start, end };
}

