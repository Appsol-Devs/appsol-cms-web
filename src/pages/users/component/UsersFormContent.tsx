import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import DropDownComponent, {
  type DropDownOption,
} from "@/components/DropdownComponent";
import { useLazyGetRolesQuery } from "@/pages/roles/common/rolesApi";
import { useEffect, useState } from "react";
import type { IUserFields } from "./UsersForm";
import { lookup_params } from "@/lib/api";
import type { IRole } from "@/pages/auth/login/common/login";
interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IUserFields, any, IUserFields>;
  isUpdate?: boolean;
}

const UsersFormContent = ({ isLoading, form, isUpdate }: IField) => {
  const [getRoles] = useLazyGetRolesQuery();
  const [roleOptions, setRoleOptions] = useState<DropDownOption[]>([]);
  const isVerified = form.watch("isVerified");
  const { control, register } = form;

  useEffect(() => {
    getRoles(lookup_params)
      .unwrap()
      .then((res) => {
        if (res?.contents) {
          setRoleOptions(
            res.contents.map((role: IRole) => ({
              value: role.id ?? "",
              label: role.name ?? "",
            })),
          );
        }
      });
  }, [getRoles]);
  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> User Basic Information
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div>
          <div className="grid grid-cols-2 gap-4">
            <CustomInputField<IUserFields>
              type="text"
              label="First Name"
              name="firstName"
              placeholder="e.g., Ana"
              required
              disabled={isLoading}
              register={register}
              rules={{
                required: "First name is required",
                min: {
                  value: 3,
                  message: "First name must be at least 3 characters",
                },
                max: {
                  value: 30,
                  message: "First name must be at most 30 characters",
                },
              }}
            />
            <CustomInputField<IUserFields>
              type="text"
              label="Last Name"
              title="Last Name"
              name="lastName"
              placeholder="e.g., Ashitey"
              required
              disabled={isLoading}
              register={register}
              rules={{
                required: "Last name is required",
                min: {
                  value: 3,
                  message: "Last name must be at least 3 characters",
                },
                max: {
                  value: 30,
                  message: "Last name must be at most 30 characters",
                },
              }}
            />
            <CustomInputField<IUserFields>
              type="text"
              label="Phone Number"
              name="phone"
              placeholder="e.g., 0240000000"
              required
              disabled={isLoading}
              register={register}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> Security Information
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div>
          <div className="grid grid-cols-2 gap-4">
            <DropDownComponent
              title="Role"
              required
              disabled={isLoading}
              control={control}
              options={roleOptions}
              name="role"
              label="Select role"
            />
            <CustomInputField<IUserFields>
              register={register}
              required
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Please enter a valid email address.",
                },
              }}
              disabled={isLoading || isVerified}
              type="email"
              name="email"
              label="Email"
            />
            {!isUpdate && (
              <CustomInputField<IUserFields>
                type="password"
                name="password"
                required
                register={register}
                label="Password"
                rules={{
                  required: "Password is required.",
                  min: {
                    value: 8,
                    message: "Password must be at least 8 characters long.",
                  },
                }}
              />
            )}
            {!isUpdate && (
              <CustomInputField<IUserFields>
                type="password"
                name="confirm_password"
                register={register}
                required
                label="Confirm Password"
                rules={{
                  required: "Password is required.",
                  min: {
                    value: 8,
                    message: "Password must be at least 8 characters long.",
                  },
                }}
              />
            )}
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default UsersFormContent;
