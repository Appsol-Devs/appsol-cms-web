import CustomInputField from "@/components/CustomInputField";
import LoadingComponent from "@/components/LoadingComponent";
import { showToast } from "@/components/ui/CustomToast";
import { Button } from "@/components/ui/button";
import { allRoutes } from "@/utils/routes";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "./common/loginApi";

type IForgotPasswordFields = {
  email: string;
};

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordFields>();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<IForgotPasswordFields> = async (data) => {
    const email = data.email.trim();
    if (!email) {
      showToast({
        title: "Validation",
        message: "Email is required.",
        type: "info",
        duration: 2000,
      });
      return;
    }

    try {
      const res = await resetPassword({ email }).unwrap();
      showToast({
        title: "Success",
        message: res.message || "OTP verification email sent.",
        type: "success",
      });
      navigate(allRoutes.RESET_PASSWORD, {
        state: {
          email: res.data?.email ?? email,
          userId: res.data?.userId,
        },
      });
    } catch (error) {
      console.error("Failed to request password reset", error);
    }
  };

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
            <p className="text-2xl font-bold text-primary">Forgot password?</p>
            <p className="text-secondary text-sm">
              Enter your email and we&apos;ll send you a verification code to
              reset your password.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="gap-3 flex flex-col my-10"
          >
            <CustomInputField<IForgotPasswordFields>
              register={register}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Please enter a valid email address.",
                },
              }}
              errors={errors}
              type="email"
              name="email"
              label="Email"
            />
            <Button
              disabled={isLoading}
              type="submit"
              variant="default"
              className="w-full bg-primary! rounded-full! text-onPrimary"
            >
              <Mail />
              <p className="text-sm">Send Reset Code</p>
            </Button>
          </form>

          <Link
            to={allRoutes.LOGIN}
            className="text-primary! text-sm flex items-center justify-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
