import CustomInputField from "@/components/CustomInputField";
import LoadingComponent from "@/components/LoadingComponent";
import { showToast } from "@/components/ui/CustomToast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { allRoutes } from "@/utils/routes";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useResendPasswordResetOtpMutation,
  useVerifyPasswordResetMutation,
} from "./common/loginApi";

type IResetPasswordFields = {
  newPassword: string;
  confirmPassword: string;
};

type ResetPasswordLocationState = {
  email?: string;
  userId?: string;
};

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResetPasswordLocationState | null) ?? {};
  const { email, userId } = state;

  const [otp, setOtp] = useState("");
  const [verifyPasswordReset, { isLoading: isVerifying }] =
    useVerifyPasswordResetMutation();
  const [resendOtp, { isLoading: isResending }] =
    useResendPasswordResetOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IResetPasswordFields>();

  useEffect(() => {
    if (!email || !userId) {
      navigate(allRoutes.FORGOT_PASSWORD, { replace: true });
    }
  }, [email, userId, navigate]);

  const handleResendOtp = async () => {
    if (!email || !userId) return;

    try {
      const res = await resendOtp({ email, userId }).unwrap();
      showToast({
        title: "Success",
        message: res.message || "A new verification code has been sent.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to resend OTP", error);
    }
  };

  const onSubmit: SubmitHandler<IResetPasswordFields> = async (data) => {
    if (!userId) return;

    if (!otp || otp.length !== 6) {
      showToast({
        title: "Validation",
        message: "Please enter the 6-digit verification code.",
        type: "info",
        duration: 2000,
      });
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      showToast({
        title: "Validation",
        message: "Passwords do not match.",
        type: "info",
        duration: 2000,
      });
      return;
    }

    try {
      const res = await verifyPasswordReset({
        userId,
        otp,
        newPassword: data.newPassword,
      }).unwrap();

      showToast({
        title: "Success",
        message: res.message || "Password reset successful.",
        type: "success",
      });
      navigate(allRoutes.LOGIN, { replace: true });
    } catch (error) {
      console.error("Failed to verify password reset", error);
    }
  };

  const isLoading = isVerifying || isResending;

  if (!email || !userId) {
    return null;
  }

  return (
    <div className="w-1/2 border-2 h-full flex items-center justify-center flex-col gap-4 relative">
      <LoadingComponent loading={isLoading} />
      <img
        className="w-48"
        src="/assets/images/logo/appsol_cmslight.png"
        alt="Appsol Logo Light mode"
      />
      <div className="p-8 bg-card text-onCard rounded-3xl w-3/5 min-h-1/3 shadow-lg">
        <div className="h-full">
          <div>
            <p className="text-2xl font-bold text-primary">Reset password</p>
            <p className="text-secondary text-sm">
              Enter the verification code sent to your email and choose a new
              password.
            </p>
            <div className="mt-3">
              <Badge variant="secondary">{email}</Badge>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="gap-4 flex flex-col my-8"
          >
            <div className="space-y-2">
              <p className="text-xs font-medium">Verification code</p>
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <CustomInputField<IResetPasswordFields>
              type="password"
              name="newPassword"
              register={register}
              label="New password"
              rules={{
                required: "New password is required.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long.",
                },
              }}
              errors={errors}
              disabled={isLoading}
            />
            <CustomInputField<IResetPasswordFields>
              type="password"
              name="confirmPassword"
              register={register}
              label="Confirm new password"
              rules={{
                required: "Please confirm your new password.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long.",
                },
              }}
              errors={errors}
              disabled={isLoading}
            />

            <Button
              disabled={isLoading}
              type="submit"
              variant="default"
              className="w-full bg-primary! rounded-full! text-onPrimary"
            >
              <KeyRound />
              <p className="text-sm">Reset Password</p>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleResendOtp}
              className="w-full rounded-full! text-xs! bg-primary! text-onPrimary!"
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend code
            </Button>
          </form>

          <Link
            to={allRoutes.LOGIN}
            className="text-primary text-sm flex items-center justify-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
