export type ILoginDetails = {
  email: string;
  password: string;
};

export type IRole = {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ILoginResponse = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: IRole;
  isActive: boolean;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  token: string;
};

export type IAuthHeaders = {
  accessToken: string;
  isLoggedIn?: boolean;
};

export type ILoginAccess = {
  role: string;
  permissions: string[];
};

export type ILoggedInUser = {
  user: ILoginResponse | null;
};

export type IUserValidationInfo = {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string;
  currentOutletId?: string;
};

export interface IChangePassword {
  id: string;
  new_password?: string;
  old_password?: string;
}

export const transformAndLogLoginData = (
  response: Response | undefined,
  avoidClear?: boolean
) => {
  if (response && response.headers) {
    const headers = response?.headers ?? {};

    if (!avoidClear) localStorage.clear();
    const accessToken: unknown = headers?.get("Accesstoken");

    const authHeaders: IAuthHeaders = {
      accessToken: accessToken as unknown as string,
      isLoggedIn: true,
    };

    localStorage.setItem("auth_headers", JSON.stringify(authHeaders));
  }
};
