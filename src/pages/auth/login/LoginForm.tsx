import CustomInputField from "@/components/CustomInputField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Shield } from "lucide-react";
import { useForm } from "react-hook-form";

export type ILoginCredential = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<ILoginCredential>();

  const handleSubmit = () => {
    const data = getValues();

    alert(JSON.stringify(data));
  };
  return (
    <div className="w-1/2 border-2 h-full flex items-center justify-center flex-col gap-4">
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
          <div className="gap-3 flex flex-col my-10">
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
              type="button"
              onClick={handleSubmit}
              variant="default"
              className="w-full bg-primary! text-onPrimary"
            >
              <LogIn />
              <p className="text-sm">Sign In</p>
            </Button>
          </div>

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
