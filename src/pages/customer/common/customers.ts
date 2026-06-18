import type { ISoftware } from '@/pages/settings/common/settings';
import type { ILoginResponse, IRole } from "@/pages/auth/login/common/login";
import type { DropDownOption } from "@/components/DropdownComponent";
import { z } from "zod";

export interface ICustomer {
  customerCode?: string
  name?: string
  email?: string
  phone?: string
  companyName?: string
  status?: string
  loggedBy?: IUser
  softwareId?: string
  software?: ISoftware
  location?: string
  notes?: string
  geolocation?: Geolocation
  image?: string
  _id?: string
  createdAt?: string
  updatedAt?: string
  dateConverted?: string
  leadId?: string
}

export interface IGeolocation {
  address?: string;
  long?: number;
  lat?: number;
}

export type CustomerStatus = "active" | "inactive";

export interface IUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: IRole;
  isActive?: boolean;
  isVerified?: boolean;
  imageUrl?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  password?: string;
  token?: string;
  deviceToken?: string;
  createdBy?: string;
}

export interface IOutReachType {
  outreachTypeCode?: string;
  name: string;
  description: string;
  isActive: boolean;
  colorCode?: string;
  _id?: string;
}

export interface INotification {
  notificationCode?: string
  message?: string
  targetEntityType?: string
  userId?: string
  user?: IUser
  link?: string
  isRead?: boolean
  targetEntityId?: string
  targetEntity?: string
  _id?: string
  createdAt?: string
  updatedAt?: string
}

export interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsReadREST: (id: string) => Promise<void>;
  markAllReadREST: () => Promise<void>;
}

export interface IRequestOTPPayload {
  userId: string;
  email: string;
}

export interface IVerifiyOTPPayload {
  userId: string;
  otp: string;
}

export interface IRequestOTPResponse {
  status: string;
  message: string;
  data: {
    userId: string;
    email: string;
  };
}
export interface IVerifyOTPResponse {
  status: string;
  message: string;
  data: ILoginResponse;
}



const customerSoftwareFieldSchema = z.union([
  z.string().min(1, "Associated Software is required"),
  z.object({
    label: z.string(),
    value: z.string().min(1, "Associated Software is required"),
  }),
]);

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address."),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Please enter a valid phone number."),
  companyName: z.string().min(1, "Company Name is required"),
  location: z.string().min(1, "Location is required"),
  softwareId: customerSoftwareFieldSchema,
  dateConverted: z.string().nullish(),
  notes: z.string().optional(),
  status: z.string().optional(),
  geolocation: z.any().optional(),
});

export type ICustomerFields = z.infer<typeof customerSchema>;

export type CustomerFormDropdownValue = string | DropDownOption<string>;

export const customerFieldToId = (
  val?: CustomerFormDropdownValue | null,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if ("value" in val) return val.value;
  return undefined;
};

export const customerFieldToLabel = (
  val?: CustomerFormDropdownValue | null,
): string | undefined => {
  if (!val) return undefined;
  if (typeof val !== "string") return val.label?.toString();
  return val;
};

export const customerFieldToDisplayLabel = (
  val?: CustomerFormDropdownValue | null,
  options?: DropDownOption<string>[],
): string | undefined => {
  if (val == null || val === "") return undefined;
  if (typeof val !== "string") {
    const label = val.label?.toString();
    if (label) return label;
    val = val.value;
  }
  const match = options?.find((o) => String(o.value) === String(val));
  return match?.label?.toString();
};
