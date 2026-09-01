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
  id?: string;
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
  | "_id"
  | "rescheduleCode"
  | "createdAt"
  | "updatedAt"
  | "customer"
  | "targetEntity"
  | "loggedBy"
>;

export type IRescheduleFormFields = Omit<
  IReschedule,
  | "_id"
  | "customer"
  | "targetEntity"
  | "loggedBy"
  | "status"
  | "targetEntityType"
> & {
  customerId?: DropDownOption<ICustomer> | null;
  targetEntityType?: string | DropDownOption<TargetEntityType> | null;
  status?: string | DropDownOption<RescheduleStatus> | null;
};

export const rescheduleCustomerToId = (
  customer?: DropDownOption<ICustomer> | null,
): string | undefined => {
  if (!customer?.value) return undefined;
  const val = customer.value;
  if (typeof val === "string") return val;
  return val.id;
};

export const rescheduleFieldToId = <T extends string>(
  val?: string | DropDownOption<T> | null,
): T | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val as T;
  return val.value as T;
};

export const rescheduleFieldToLabel = <T extends string>(
  val?: string | DropDownOption<T> | null,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.label?.toString();
};

export const getTargetEntityTypeFromForm = (
  v?: IRescheduleFormFields["targetEntityType"],
): TargetEntityType | undefined => rescheduleFieldToId(v);

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
