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
  Check,
  Ban,
} from "lucide-react";

type AlertType = "success" | "warning" | "error" | "info" | "delete";

interface IConfirmationDialog {
  title?: string;
  content: ReactNode;
  trigger?: ReactNode;
  triggerClassName?: string; // Optional styling for the trigger
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "fullscreen";
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
  success: { icon: CheckCircle, color: "text-green-600", btn: "bg-green-600 hover:bg-green-700" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", btn: "bg-yellow-600 hover:bg-yellow-700" },
  error: { icon: XCircle, color: "text-red-600", btn: "bg-red-600 hover:bg-red-700" },
  info: { icon: Info, color: "text-blue-600", btn: "bg-blue-600 hover:bg-blue-700" },
  delete: { icon: Trash2, color: "text-red-600", btn: "bg-red-600 hover:bg-red-700" },
};

const ConfirmationDialog = ({
  title = "Are you sure?",
  trigger,
  triggerClassName,
  maxWidth = "md",
  content,
  leftActionTitle = "Cancel",
  rightActionTitle = "Yes",
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
          "gap-0",
          maxWidth === "fullscreen" ? "max-w-[95vw] h-[95vh]" : `max-w-${maxWidth}`,
          "[&>button]:text-white [&>button]:opacity-100 [&>button]:hover:opacity-80"
        )}
      >
        <div className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Icon className={cn("w-12 h-12", config.color)} />
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </div>

          <div className="py-6 flex items-center justify-center text-muted-foreground text-sm">
            {content}
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            className="text-white bg-slate-500 hover:bg-slate-600 hover:text-white border-none"
          >
            <Ban className="mr-2 h-4 w-4" />
            {leftActionTitle}
          </Button>

          <Button
            className={cn(
              "min-w-24 text-white", 
              alertType === "delete" ? "bg-red-600 hover:bg-red-700" : config.btn
            )}
            disabled={disabled}
            onClick={() => {
              onConfirmClicked?.();
              handleOpenChange(false);
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            {rightActionTitle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;