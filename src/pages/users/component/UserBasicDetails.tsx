import CardComponent from "@/components/CardComponent";
import { Separator } from "@/components/ui/separator";
import { type UseFormReturn } from "react-hook-form";
import { BookOpenText } from "lucide-react";
import { useLazyGetRolesQuery } from "@/pages/roles/common/rolesApi";
import type { IUserFields } from "./UsersForm";
import { useEffect, useState } from "react";
import type { DropDownOption } from "@/components/DropdownComponent";
import CustomInputField from "@/components/CustomInputField";
import DropDownComponent from "@/components/DropdownComponent";

const UserBasicDetails = ({
  form,
  isLoading,
}: {
  form: UseFormReturn<IUserFields, any, IUserFields>;
  isLoading?: boolean;
}) => {
  const [getAllRoles] = useLazyGetRolesQuery();

  const [roleOptions, setRoleOptions] = useState<DropDownOption[]>([]);

  useEffect(() => {
    getAllRoles({}).then((response) => {
      if (response && response.data) {
        const options: DropDownOption[] = response.data.contents.map(
          (role) => ({
            value: role._id,
            label: role.name,
          })
        );
        setRoleOptions(options);
      }
    });
  }, []);

  const { control, register } = form;

  return (
    <div className="md:w-2/3 space-y-2">
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
            {/* <DropDownComponent
              title="Title"
              disabled={isLoading}
              control={control}
              options={titleOptions}
              name="title"
              label="Select a title"
            /> */}
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
              label="Select user Role"
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
              type="email"
              name="email"
              label="Email"
            />
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
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default UserBasicDetails;
