import CustomInputField from "@/components/CustomInputField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Shield } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLoginUserMutation } from "./common/loginApi";
import { showToast } from "@/components/ui/CustomToast";
import { setCurrentUser } from "./common/loginSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import LoadingComponent from "@/components/LoadingComponent";

export type ILoginCredential = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginCredential>();
  const [loginMutaton, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<ILoginCredential> = async (
    data: ILoginCredential
  ) => {
    const newData: ILoginCredential = { ...data };
    handleSubmission(newData);
  };

  const handleSubmission = async (data: ILoginCredential) => {
    const requiredFields = [
      { field: data.email, message: "Email field is required." },
      { field: data.password, message: "Password is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    try {
      if (data.email && data.password) {
        await loginMutaton(data)
          .unwrap()
          .then((res) => {
            showToast({
              message: `User ${data.email} has been logged in successful!"`,
              type: "success",
              title: "User Login",
            });
            dispatch(setCurrentUser(res));
            navigate(`${allRoutes.PORTAL}${allRoutes.DASHBOARD}`);
          })
          .catch(() =>
            showToast({
              title: "Could not login.",
              message: "Invalid Login Credentials. Check credentials and retry",
              type: "error",
            })
          );
      }
    } catch (err) {
      showToast({
        title: "Could not login.",
        message: "Invalid Login Credentials. Check credentials and retry",
        type: "error",
      });
    }
  };

  return (
    <div className="w-1/2 border-2 h-full flex items-center justify-center flex-col gap-4 relative">
      <LoadingComponent loading={isLoading} />
      <div className="p-8 bg-card text-onCard rounded-3xl w-3/5 min-h-1/3 shadow-lg">
        <div className="h-full">
          <div>
            <p className="text-2xl font-bold text-primary">
              Sign in to your account
            </p>
            <p className="text-secondary text-sm">
              Enter your credentials to access the console
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="gap-3 flex flex-col my-10"
          >
            <CustomInputField<ILoginCredential>
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
            <CustomInputField<ILoginCredential>
              type="password"
              name="password"
              register={register}
              label="Password"
              rules={{
                required: "Password is required.",
                min: {
                  value: 8,
                  message: "Password must be at least 8 characters long.",
                },
              }}
              errors={errors}
            />
            <div className="w-full flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox className="h-8! w-8! bg-surface! checked:text-primary! text-primary! border-outline!" />
                <p>Remember me</p>
              </div>
              <div>
                <p>Forgot password?</p>
              </div>
            </div>
            <Button
              type="submit"
              variant="default"
              className="w-full bg-primary! rounded-full! text-onPrimary"
            >
              <LogIn />
              <p className="text-sm">Sign In</p>
            </Button>
          </form>

          <p className="text-secondary text-sm mx-auto w-full text-center">
            New to the console?{" "}
            <span className="text-primary">Request access.</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Shield className="w-4 h-4" />
        <p className="text-secondary text-sm mx-auto w-full text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
