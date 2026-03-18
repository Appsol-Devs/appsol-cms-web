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

