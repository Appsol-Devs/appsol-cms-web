import { FEATURE_PRIORITY_COLORS, FEATURE_STATUS_COLORS } from "@/lib/helpers";
import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import type { ISoftware } from "@/pages/settings/common/settings";

export interface IFeatureRequest {
  id?: string;
  requestCode?: string;
  title?: string;
  customerId?: string;
  customer?: ICustomer | string;
  softwareId?: string;
  software?: ISoftware | string;
  requestedDate?: string;
  notes?: string;
  description?: string;
  priority?: string;
  status?: TFeatureRequestStatus;
  loggedBy?: IUser | string;
  assignedTo?: Array<IUser> | Array<string>;
  createdAt?: string;
  updatedAt?: string;
}

export type TFeatureRequestStatus =
  | "new"
  | "under-review"
  | "planned"
  | "complete"
  | "rejected";

export const getStatusColor = (status?: string): string | undefined => {
  if (!status) return undefined;
  return FEATURE_STATUS_COLORS[status.toLowerCase()];
};

export const getPriorityColor = (priority?: string): string | undefined => {
  if (!priority) return undefined;
  return FEATURE_PRIORITY_COLORS[priority.toLowerCase()];
};
