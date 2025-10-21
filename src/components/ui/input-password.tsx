import * as React from "react";
import { Eye, EyeClosed } from "lucide-react";
import classNames from "classnames";
import { Input } from "./input";

const InputPassword = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={classNames("pr-10", className)}
        ref={ref}
        {...props}
      />
      <div
        className="absolute right-0 top-0.5 h-full hover:cursor-pointer px-3 py-2 hover:bg-transparent bg-transparent! hover:outline-0 hover:ring-0 hover:border-0 text-onSurface"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeClosed className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
    </div>
  );
});
InputPassword.displayName = "InputPassword";

export { InputPassword };
