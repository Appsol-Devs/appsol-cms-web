import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  Check,
  Ban,
} from "lucide-react";

interface IConfirmationDialog {
  title?: string;
  children?: ReactNode;
  trigger?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "fullscreen";
  content: ReactNode;
  leftActionTitle?: string;
  rightActionTitle?: string;
  disableOutsideClick?: boolean;
  onConfirmClicked?: () => void;
  alertType?: "success" | "warning" | "error" | "info" | "delete";
  visible?: boolean;
  onClose?: () => void;
  disabled?: boolean;
}

const ConfirmationDialog = ({
  title = "Are you sure?",
  trigger,
  maxWidth,
  content,
  leftActionTitle = "Cancel",
  disableOutsideClick = true,
  rightActionTitle = "Yes",
  onConfirmClicked,
  alertType = "info",
  visible = false,
  onClose,
  disabled = false,
}: IConfirmationDialog) => {
  const [open, setOpen] = useState<boolean>(false);

  // Sync visibility with external control
  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const handleConfirm = () => {
    onConfirmClicked?.();
    setOpen(false);
    onClose?.();
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const renderIcon = () => {
    switch (alertType) {
      case "success":
        return <CheckCircle className="w-10 h-10 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-10 h-10 text-yellow-600" />;
      case "error":
        return <XCircle className="w-10 h-10 text-red-600" />;
      case "delete":
        return <Trash2 className="w-10 h-10 text-red-600" />;
      case "info":
      default:
        return <Info className="w-10 h-10 text-blue-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        onInteractOutside={
          disableOutsideClick ? (e) => e.preventDefault() : undefined
        }
        className={`${
          maxWidth === "fullscreen"
            ? "max-w-[95vw] h-[95vh]"
            : `max-w-${maxWidth}`
        }`}
      >
        <DialogTitle></DialogTitle>
        <div>
          <div className="flex items-center flex-col gap-4">
            {renderIcon()}
            <p className="text-xl font-semibold">{title}</p>
          </div>
        </div>

        <div className="py-4 flex items-center justify-center">{content}</div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <Ban className="w-4 h-4" />

            {leftActionTitle}
          </Button>
          <Button
            className="min-w-24"
            onClick={handleConfirm}
            disabled={disabled}
          >
            <Check className="w-4 h-4" />
            {rightActionTitle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
