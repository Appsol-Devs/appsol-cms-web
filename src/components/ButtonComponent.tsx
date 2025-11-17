import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { LoaderPinwheel } from "lucide-react";

interface IButton {
  onSubmit?: (e: any) => void;
  isLoading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  size?: "icon" | "default" | "lg" | "sm";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children?: React.ReactNode;
}
const ButtonComponent = ({
  size = "default",
  onSubmit,
  variant,
  isLoading,
  className,
  disabled,
  loadingText,
  children,
}: // type = "button",
IButton) => {
  return (
    <Button
      // type={type}
      variant={variant}
      onClick={(e) => onSubmit?.(e)}
      size={size}
      className={cn("w-full", className)}
      disabled={disabled}
    >
      {isLoading ? (
        <>
          {isLoading ? (
            <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {(isLoading && loadingText) || "Loading..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default ButtonComponent;
