import type { ISoftware } from '@/pages/settings/common/settings';
import type { ILoginResponse, IRole } from "@/pages/auth/login/common/login";

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

export interface IOutReachType{
  outreachTypeCode?: string
  name: string
  description: string
  isActive: boolean
  colorCode?: string
  _id?: string
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
