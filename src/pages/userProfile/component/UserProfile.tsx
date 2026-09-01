import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, resetMutationForm } from "@/lib/helpers";
import { readFileAsDataUrl } from "@/lib/upload";
import type { ILoginResponse } from "@/pages/auth/login/common/login";
import { setCurrentUser } from "@/pages/auth/login/common/loginSlice";
import type { IUser } from "@/pages/customer/common/customers";
import {
  useLazyGetAUserQuery,
  useUpdateUserProfileMutation,
} from "@/pages/users/common/usersApi";
import { BookOpenText, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import UserProfileFormContent from "./UserProfileFormContent";
import UserProfileView from "./UserProfileView";

export type IUserProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  imageUrl?: string;
};

function mergeUserProfile(
  current: ILoginResponse,
  updated: Partial<IUser>,
): ILoginResponse {
  const updatedAt =
    updated.updatedAt instanceof Date
      ? updated.updatedAt.toISOString()
      : typeof updated.updatedAt === "string"
        ? updated.updatedAt
        : current.updatedAt;

  return {
    ...current,
    firstName: updated.firstName ?? current.firstName,
    lastName: updated.lastName ?? current.lastName,
    email: updated.email ?? current.email,
    phone: updated.phone ?? current.phone,
    imageUrl:
      updated.imageUrl !== undefined ? updated.imageUrl : current.imageUrl,
    updatedAt,
  };
}

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoRemoved, setProfilePhotoRemoved] = useState(false);
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();
  const [getAUser] = useLazyGetAUserQuery();

  const form = useForm<IUserProfileFields>();
  const { watch, getValues, reset, setValue } = form;
  const values = watch();

  const getEmptyProfileValues = (): IUserProfileFields => ({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    imageUrl: "",
  });

  const getProfileValues = (data: ILoginResponse): IUserProfileFields => ({
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    imageUrl: data.imageUrl ?? "",
  });

  useEffect(() => {
    if (user && !isEditing) {
      reset(getProfileValues(user));
    }
  }, [user, reset, isEditing]);

  const handleResetForm = () => {
    resetMutationForm(form, getEmptyProfileValues());
    setProfilePhotoFile(null);
    setProfilePhotoRemoved(false);
  };

  const handlePhotoFileChange = (file: File | null) => {
    setProfilePhotoFile(file);
    if (file) setProfilePhotoRemoved(false);
  };

  const handleImageUrlChange = (imageUrl: string) => {
    setValue("imageUrl", imageUrl, { shouldDirty: true });
    if (!imageUrl) setProfilePhotoRemoved(true);
  };

  const validateProfileForm = (): boolean => {
    const data = getValues();

    const requiredFields = [
      { field: data.firstName?.trim(), message: "First name is required." },
      { field: data.lastName?.trim(), message: "Last name is required." },
      { field: data.phone?.trim(), message: "Phone number is required." },
      { field: data.email?.trim(), message: "Email is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({
          title: "Validation",
          message,
          type: "info",
          duration: 2000,
        });
        return false;
      }
    }

    return true;
  };

  const validateBeforeOpen = async () => validateProfileForm();

  const submitData = async () => {
    if (!user?.id || !validateProfileForm()) return;

    const data = getValues();

    let imageUrl: string | undefined;

    if (profilePhotoRemoved) {
      imageUrl = "";
    } else if (profilePhotoFile) {
      try {
        imageUrl = await readFileAsDataUrl(profilePhotoFile);
      } catch (error) {
        console.error("Failed to read profile photo", error);
        showToast({
          title: "Error",
          message: "Could not read the selected photo. Please try again.",
          type: "error",
        });
        return;
      }
    } else {
      const trimmedImageUrl = data.imageUrl?.trim();
      imageUrl = trimmedImageUrl || undefined;
    }

    const profileFields = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    };

    const payload = {
      ...cleanPayload(profileFields),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    };

    try {
      const res = await updateProfile({
        id: user.id,
        ...payload,
      }).unwrap();

      const resolvedImageUrl = profilePhotoRemoved
        ? ""
        : res?.imageUrl !== undefined
          ? res.imageUrl
          : payload.imageUrl;

      let updatedUser = mergeUserProfile(user, {
        ...res,
        firstName: res?.firstName ?? profileFields.firstName,
        lastName: res?.lastName ?? profileFields.lastName,
        email: res?.email ?? profileFields.email,
        phone: res?.phone ?? profileFields.phone,
        imageUrl: resolvedImageUrl,
      });

      try {
        const fresh = await getAUser(user.id).unwrap();
        updatedUser = mergeUserProfile(updatedUser, {
          ...fresh,
          ...(profilePhotoRemoved ? { imageUrl: "" } : {}),
        });
      } catch {}

      dispatch(setCurrentUser(updatedUser));
      reset(getProfileValues(updatedUser));
      setProfilePhotoFile(null);
      setProfilePhotoRemoved(false);
      setIsEditing(false);

      showToast({
        title: "Success",
        message: "Profile updated successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update profile", error);
      showToast({
        title: "Error",
        message: "Failed to update profile.",
        type: "error",
      });
    }
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Basic Information",
      icon: <BookOpenText className="w-4 h-4" />,
      data: [
        { label: "First Name", value: values?.firstName, required: true },
        { label: "Last Name", value: values?.lastName, required: true },
        { label: "Phone Number", value: values?.phone, required: true },
      ],
    },
    {
      title: "Account",
      icon: <Shield className="w-4 h-4" />,
      data: [
        { label: "Email", value: values?.email, required: true },
        { label: "Role", value: user?.role?.name ?? "—", required: false },
      ],
    },
  ];

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No user data available. Please log in.
      </div>
    );
  }

  if (!isEditing) {
    return (
      <UserProfileView
        user={user}
        onEdit={() => {
          reset(getProfileValues(user));
          setProfilePhotoFile(null);
          setProfilePhotoRemoved(false);
          setIsEditing(true);
        }}
      />
    );
  }

  return (
    <MutationFormTemplate<IUserProfileFields>
      form={form}
      showBack={false}
      pageSummary={{
        title: "Edit Profile",
        description: "Update your personal account details and preferences.",
        icon: User,
      }}
      formContent={
        <UserProfileFormContent
          form={form}
          isLoading={isUpdating}
          onPhotoFileChange={handlePhotoFileChange}
          onImageUrlChange={handleImageUrlChange}
        />
      }
      submitData={submitData}
      confirmOnSubmit
      validateBeforeOpen={validateBeforeOpen}
      confirmSubmitTitle="Confirm Profile Update"
      confirmSubmitContent={
        <div className="text-center">
          <p>Are you sure you want to save changes to your profile?</p>
        </div>
      }
      confirmSubmitActionLabel="Save Profile"
      pageTitle="Edit Profile"
      loading={isUpdating}
      mutationFormSummary={{
        summaryData: summarySections,
        summaryMainTitle: "Profile Summary",
        summarySaveButtonText: "Save Profile",
      }}
      onResetForm={handleResetForm}
    />
  );
};

export default UserProfile;
