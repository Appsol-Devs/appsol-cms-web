import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers";
import { BookOpenText, ImageIcon, Shield } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { IUserProfileFields } from "./UserProfile";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IUserProfileFields, any, IUserProfileFields>;
}

const UserProfileFormContent = ({ isLoading, form }: IField) => {
  const { register, watch } = form;
  const values = watch();

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Profile Photo
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-muted shadow-sm">
            <AvatarImage
              src={values.imageUrl || undefined}
              alt={`${values.firstName ?? ""} ${values.lastName ?? ""}`}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-bold">
              {getInitials(values.firstName, values.lastName) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 w-full">
            <CustomInputField<IUserProfileFields>
              type="text"
              label="Image URL"
              name="imageUrl"
              placeholder="https://example.com/photo.jpg"
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
                <BookOpenText className="w-4 h-4" /> Basic Information
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField<IUserProfileFields>
            type="text"
            label="First Name"
            name="firstName"
            placeholder="e.g., Ana"
            required
            disabled={isLoading}
            register={register}
            rules={{
              required: "First name is required",
              minLength: {
                value: 2,
                message: "First name must be at least 2 characters",
              },
            }}
          />
          <CustomInputField<IUserProfileFields>
            type="text"
            label="Last Name"
            name="lastName"
            placeholder="e.g., Acheampong"
            required
            disabled={isLoading}
            register={register}
            rules={{
              required: "Last name is required",
              minLength: {
                value: 2,
                message: "Last name must be at least 2 characters",
              },
            }}
          />
          <CustomInputField<IUserProfileFields>
            type="text"
            label="Phone Number"
            name="phone"
            placeholder="e.g., 0240000000"
            required
            disabled={isLoading}
            register={register}
            rules={{ required: "Phone number is required" }}
          />
          <CustomInputField<IUserProfileFields>
            register={register}
            required
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Please enter a valid email address.",
              },
            }}
            disabled={isLoading}
            type="email"
            name="email"
            placeholder="e.g., mail@example.com"
            label="Email"
          />
        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Security
              </p>
              <p className="text-xs text-rx-secondary">Optional</p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField<IUserProfileFields>
            type="password"
            name="password"
            register={register}
            label="New Password"
            placeholder="Leave blank to keep current password"
            disabled={isLoading}
            rules={{
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long.",
              },
            }}
          />
          <CustomInputField<IUserProfileFields>
            type="password"
            name="confirm_password"
            register={register}
            label="Confirm New Password"
            placeholder="Re-enter new password"
            disabled={isLoading}
          />
        </div>
      </CardComponent>
    </div>
  );
};

export default UserProfileFormContent;
