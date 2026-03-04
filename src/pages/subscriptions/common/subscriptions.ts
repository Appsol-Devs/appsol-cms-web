import type { DropDownOption } from "@/components/DropdownComponent";
import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import type {
  ISoftware,
  ISubscriptionType,
} from "@/pages/settings/common/settings";

export interface ILastPayment {
  _id?: string;
  customerId?: string;
  customer?: ICustomer;
  softwareId?: string;
  software?: ISoftware;
  amount?: number;
  subscriptionTypeId?: string;
  subscriptionType?: ISubscriptionType;
  notes?: string;
  paymentDate?: string;
  renewalDate?: string;
  status?: string;
  paymentReference?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  paymentCode?: string;
  approvalNotes?: string;
  approvedOrRejectedBy?: string;
}

export interface ISubscription {
  _id?: string;
  subscriptionCode?: string;
  customerId?: string;
  customer?: ICustomer;
  softwareId?: string;
  software?: ISoftware;
  subscriptionTypeId?: string;
  subscriptionType?: ISubscriptionType;
  status?: string;
  startDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextBillingDate?: string;
  lastPaymentId?: string;
  lastPayment?: ILastPayment;
  lastPaymentDate?: string;
  amount?: number;
  autoRenew?: boolean;
  cancelledAt?: string;
  cancelledBy?: IUser;
  cancellationReason?: string;
  notes?: string;
  loggedBy?: IUser | string;
  createdAt?: string;
  updatedAt?: string;
}

export type ISubscriptionFields = Omit<
  ISubscription,
  "_id" | "customer" | "software" | "subscriptionType" | "lastPayment"
> & {
  customerId?: DropDownOption<string>;
  softwareId?: DropDownOption<string>;
  subscriptionTypeId?: DropDownOption<string>;
  status?: DropDownOption<string>;
};
