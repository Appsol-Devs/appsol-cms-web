import type { DropDownOption } from "@/components/DropdownComponent";
import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import type {
  ISoftware,
  ISubscriptionType,
} from "@/pages/settings/common/settings";

export interface IPayment {
  _id?: string;
  paymentCode?: string;
  customerId?: string;
  customer?: ICustomer;
  softwareId?: string;
  software?: ISoftware;
  subscriptionTypeId?: string;
  subscriptionType?: ISubscriptionType;
  amount?: number;
  paymentDate?: string;
  renewalDate?: string;
  notes?: string;
  paymentReference?: string;
  status?: string;
  approvalNotes?: string;
  approvedOrRejectedBy?: IUser | string;
  loggedBy?: IUser | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaymentCreatePayload {
  customerId: string;
  subscriptionTypeId: string;
  softwareId?: string;
  paymentDate: string;
  renewalDate: string;
  amount: number;
  notes: string;
  paymentReference: string;
}

export interface IPaymentFormFields extends Record<string, unknown> {
  customerId?: DropDownOption<string>;
  softwareId?: DropDownOption<string>;
  subscriptionTypeId?: DropDownOption<string>;
  amount?: number;
  paymentDate?: string;
  renewalDate?: string;
  notes?: string;
  paymentReference?: string;
}
