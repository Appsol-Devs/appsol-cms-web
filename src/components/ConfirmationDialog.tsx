import { type ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
} from "lucide-react";

type AlertType = "success" | "warning" | "error" | "info" | "delete";

interface IConfirmationDialog {
  title?: string;
  content: ReactNode;
  trigger?: ReactNode;
  triggerClassName?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  leftActionTitle?: string;
  rightActionTitle?: string;
  disableOutsideClick?: boolean;
  onConfirmClicked?: () => void;
  alertType?: AlertType;
  visible?: boolean;
  onClose?: () => void;
  disabled?: boolean;
}

const variantConfigs = {
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    btn: "bg-green-600 hover:bg-green-700 focus:ring-green-600",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    btn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600",
  },
  error: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    btn: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    btn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600",
  },
  delete: {
    icon: Trash2,
    color: "text-red-600",
    bgColor: "bg-red-100",
    btn: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
  },
};

const ConfirmationDialog = ({
  title = "Are you sure?",
  trigger,
  triggerClassName,
  maxWidth = "sm",
  content,
  leftActionTitle = "No, Keep it",
  rightActionTitle = "Yes, Delete it!",
  disableOutsideClick = true,
  onConfirmClicked,
  alertType = "info",
  visible = false,
  onClose,
  disabled = false,
}: IConfirmationDialog) => {
  const [open, setOpen] = useState<boolean>(visible);

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) onClose?.();
  };

  const config = variantConfigs[alertType];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild className={triggerClassName}>
          {trigger}
        </DialogTrigger>
      )}

      <DialogContent
        onInteractOutside={(e) => disableOutsideClick && e.preventDefault()}

        className={cn(
          "p-6 gap-0 rounded-xl overflow-hidden bg-white",
          maxWidth === "xs" ? "max-w-xs" : 
          maxWidth === "sm" ? "max-w-sm" : 
          maxWidth === "md" ? "max-w-md" : 
          maxWidth === "lg" ? "max-w-lg" : "max-w-xl",
          "[&>button]:bg-transparent [&>button]:border-none [&>button]:hover:bg-transparent [&>button]:text-gray-400 [&>button]:top-4 [&>button]:right-4"
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className={cn("rounded-full p-3 mb-4", config.bgColor)}>
            <Icon className={cn("w-6 h-6", config.color)} />
          </div>

          <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </DialogTitle>

          <div className="text-sm text-gray-500 mb-8 max-w-[90%] leading-relaxed">
            {content}
          </div>

          <DialogFooter className="w-full grid grid-cols-2 gap-3 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-none font-medium rounded-lg h-11"
            >
              {leftActionTitle}
            </Button>

            <Button
              className={cn(
                "w-full text-white font-medium rounded-lg h-11 shadow-none transition-colors",
                config.btn
              )}
              disabled={disabled}
              onClick={() => {
                onConfirmClicked?.();
                handleOpenChange(false);
              }}
            >
              {rightActionTitle}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;