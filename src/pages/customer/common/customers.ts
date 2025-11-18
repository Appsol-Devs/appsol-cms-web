import type { ILoginResponse, IRole } from "@/pages/auth/login/common/login";

export interface ICustomer {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  dateConverted?: string;
  notes?: string;
  geolocation?: IGeolocation;
  location?: string;
  status?: CustomerStatus;
  loggedBy?: IUser | string;
  createdAt?: string;
  updatedAt?: string;
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
  role?: IRole | string;
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
