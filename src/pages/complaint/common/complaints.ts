import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import type {
  IComplaintCategory,
  IComplaintType,
  ISoftware,
} from "@/pages/settings/common/settings";
import type { ITicket } from "@/pages/ticket/common/tickets";

export type IComplaint = {
  _id?: string;
  complaintCode?: string;
  customerId?: string;
  customer?: ICustomer;
  complaintTypeId?: string;
  complaintType?: IComplaintType;
  complaintCategoryId?: string;
  complaintCategory?: IComplaintCategory;
  relatedSoftwareId?: string;
  relatedSoftware?: ISoftware;
  description?: string;
  status?: string;
  loggedBy?: IUser;
  ticketId?: string;
  ticket?: ITicket;
  createdAt?: string;
  updatedAt?: string;
};
