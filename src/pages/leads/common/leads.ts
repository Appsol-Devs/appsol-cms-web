import type { IUser } from "@/pages/customer/common/customers";
import type { ILeadNextStep } from "@/pages/settings/common/settings";
import type { ISoftware } from "@/pages/settings/common/settings";

export type ILead = {
  leadCode?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  leadSource?: string;
  softwareId?: string;
  software?: ISoftware;
  initialEnquiryDate?: string;
  leadStatus?: string;
  loggedBy?: IUser;
  createdAt?: string;
  updatedAt?: string;
  leadStage?: ILeadNextStep;
  priority?: string;
  nextStep?: ILeadNextStep;
  location?: string;
  notes?: string;
  _id?: string;
};
