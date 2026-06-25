import CustomInputField from "@/components/CustomInputField";
import { showToast } from "@/components/ui/CustomToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChangePasswordMutation } from "@/pages/auth/login/common/loginApi";
import { KeyRound, Loader2, Shield, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export type IChangePasswordFields = {
  currentPassword: string;
  newPassword: string;
  confirm_password: string;
};

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: IChangePasswordFields = {
  currentPassword: "",
  newPassword: "",
  confirm_password: "",
};

const ChangePasswordModal = ({
  open,
  onOpenChange,
}: ChangePasswordModalProps) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { register, handleSubmit, reset, getValues } =
    useForm<IChangePasswordFields>({
      defaultValues: emptyValues,
    });

  useEffect(() => {
    if (!open) {
      reset(emptyValues);
    }
  }, [open, reset]);

  const validateForm = (): boolean => {
    const data = getValues();
    const currentPassword = data.currentPassword?.trim();
    const newPassword = data.newPassword?.trim();
    const confirmPassword = data.confirm_password?.trim();

    if (!currentPassword) {
      showToast({
        title: "Validation",
        message: "Current password is required.",
        type: "info",
        duration: 2000,
      });
      return false;
    }

    if (!newPassword) {
      showToast({
        title: "Validation",
        message: "New password is required.",
        type: "info",
        duration: 2000,
      });
      return false;
    }

    if (!confirmPassword) {
      showToast({
        title: "Validation",
        message: "Please confirm your new password.",
        type: "info",
        duration: 2000,
      });
      return false;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        title: "Validation",
        message: "New passwords do not match.",
        type: "info",
        duration: 2000,
      });
      return false;
    }

    if (newPassword.length < 8) {
      showToast({
        title: "Validation",
        message: "New password must be at least 8 characters long.",
        type: "info",
        duration: 2000,
      });
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    const data = getValues();
    const currentPassword = data.currentPassword.trim();
    const newPassword = data.newPassword.trim();

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      showToast({
        title: "Success",
        message: "Password updated successfully.",
        type: "success",
      });
      onOpenChange(false);
      reset(emptyValues);
    } catch (error) {
      console.error("Failed to change password", error);
      showToast({
        title: "Error",
        message: "Could not change password. Check your current password and try again.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="backdrop-blur-sm bg-black/40"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <CustomInputField<IChangePasswordFields>
            type="password"
            name="currentPassword"
            register={register}
            label="Current Password"
            placeholder="Enter your current password"
            disabled={isLoading}
            required
          />
          <CustomInputField<IChangePasswordFields>
            type="password"
            name="newPassword"
            register={register}
            label="New Password"
            placeholder="Enter a new password"
            disabled={isLoading}
            required
          />
          <CustomInputField<IChangePasswordFields>
            type="password"
            name="confirm_password"
            register={register}
            label="Confirm New Password"
            placeholder="Re-enter new password"
            disabled={isLoading}
            required
          />

          <DialogFooter className="w-full grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="w-full! bg-red-700! text-white hover:bg-red-800! border-0! h-11! px-6! font-medium shadow-none!"
            >
              <X className="size-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full! bg-primary! text-primary-foreground! hover:bg-primary/90! border-0! h-11! px-6! font-medium shadow-none!"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  Update Password
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
