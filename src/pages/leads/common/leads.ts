import type { DropDownOption } from "@/components/DropdownComponent";
import type { ICustomer, IUser } from "@/pages/customer/common/customers";
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
  isConverted?: boolean;
  customerId?: string;
  customer?: ICustomer;
};

export const mapLeadToCustomerPrefill = (lead: ILead): Partial<ICustomer> => ({
  name: lead.name ?? "",
  email: lead.email ?? "",
  phone: lead.phone ?? "",
  companyName: lead.companyName ?? "",
  location: lead.location ?? "",
  notes: lead.notes ?? "",
  softwareId: lead.softwareId,
  dateConverted: new Date().toISOString().split("T")[0],
  leadId: lead._id,
  status: "active",
});

export type LeadFormDropdownValue = string | DropDownOption<string> | null;

export const leadFieldToId = (
  val?: LeadFormDropdownValue,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if ("value" in val) return val.value;
  return undefined;
};

export const leadFieldToLabel = (
  val?: LeadFormDropdownValue,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.label?.toString();
};
