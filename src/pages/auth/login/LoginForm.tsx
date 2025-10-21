import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Shield } from "lucide-react";

const LoginForm = () => {
  return (
    <div className="w-1/2 border-2 h-full flex items-center justify-center flex-col gap-4">
      <div className="p-8 bg-card text-onCard rounded-3xl w-3/5 min-h-1/3 shadow-lg">
        <div className="h-full">
          <div>
            <p className="text-2xl font-bold">Sign in to your account</p>
            <p className="text-secondary text-sm">
              Enter your credentials to access the console
            </p>
          </div>
          <div className="gap-3 flex flex-col my-10">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
            </div>
            <div className="w-full flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox className="h-8" />
                <p>Remember me</p>
              </div>
              <div>
                <p>Forgot password?</p>
              </div>
            </div>
            <Button className="w-full">
              <LogIn />
              <p className="text-sm">Sign In</p>
            </Button>
          </div>

          <p className="text-secondary text-sm mx-auto w-full text-center">
            New to the console?{" "}
            <span className="text-onCard">Request access.</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Shield className="w-4 h-4" />
        <p className="text-secondary text-sm mx-auto w-full text-center">
          By continuing, you agreen to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
