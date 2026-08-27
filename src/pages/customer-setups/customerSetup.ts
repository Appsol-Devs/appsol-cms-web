import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import type { ISetupStatus, ISoftware } from "@/pages/settings/common/settings";

export interface ICustomerSetup {
  _id?: string;
  setupCode?: string;
  title?: string;
  customerId?: string;
  customer?: ICustomer;

  softwareId?: string;
  software?: ISoftware | string;

  setupStatusId?: string;
  setupStatus?: ISetupStatus | string;

  scheduledStart?: string;
  scheduledEnd?: string;
  actualCompletionDate?: string;

  notes?: string;
  description?: string;

  priority?: string;
  status?: TCustomerSetupStatus;

  loggedBy?: IUser | string;
  assignedTo?: Array<IUser> | Array<string>;

  createdAt?: string;
  updatedAt?: string;
  addToCalendar?: boolean;
}

export type TCustomerSetupStatus =
  | "scheduled"
  | "inProgress"
  | "completed"
  | "cancelled";
