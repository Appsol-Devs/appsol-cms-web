import type {
  ICustomer,
  IOutReachType,
  IUser,
} from "@/pages/customer/common/customers";
import type { ICallStatus } from "@/pages/settings/common/settings";

export interface ICustomerOutreach {
  customerId: string;
  customer: ICustomer;
  purpose: string;
  notes: string;
  callStatus: ICallStatus;
  outreachType: IOutReachType;
  outreachTypeId: string;
  callStatusId: string;
  isRoutineCall: boolean;
  loggedBy: IUser;
  status: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  outreachCode?: string;
}


