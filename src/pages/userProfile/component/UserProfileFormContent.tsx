import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText, ImageIcon, Shield } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { IUserProfileFields } from "./UserProfile";
import ProfilePhotoUpload from "./ProfilePhotoUpload";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IUserProfileFields, any, IUserProfileFields>;
  onPhotoFileChange: (file: File | null) => void;
  onImageUrlChange: (imageUrl: string) => void;
}

const UserProfileFormContent = ({
  isLoading,
  form,
  onPhotoFileChange,
  onImageUrlChange,
}: IField) => {
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
        <ProfilePhotoUpload
          imageUrl={values.imageUrl}
          firstName={values.firstName}
          lastName={values.lastName}
          disabled={isLoading}
          onPhotoFileChange={onPhotoFileChange}
          onImageUrlChange={onImageUrlChange}
        />
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
            name="currentPassword"
            register={register}
            label="Current Password"
            placeholder="Leave blank to keep your current password"
            disabled={isLoading}
          />
          <CustomInputField<IUserProfileFields>
            type="password"
            name="newPassword"
            register={register}
            label="New Password"
            placeholder="Enter a new password"
            disabled={isLoading}
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
