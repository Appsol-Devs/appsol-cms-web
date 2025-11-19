import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import DialogComponent from "./DialogComponent";

export interface DataControlEntityProps {
  dialogTitle: string;
  dialogDescription?: string;
  buttonText?: string;
  controlType?: "add" | "edit" | "delete";
  children: ReactNode;
  trigger?: ReactNode;
  footer?: ReactNode;
  closeDialog?: boolean;
  disabled?: boolean;
  maxwidth?: "xs" | "sm" | "lg" | "md" | "xl";
}

const ActionDialog = ({
  dialogTitle,
  dialogDescription,
  trigger,
  // buttonText,
  children,
  footer,
  controlType,
  disabled,
  closeDialog,
  maxwidth,
}: DataControlEntityProps) => {
  const [close, setClose] = useState<boolean>(false);

  useEffect(() => {
    if (closeDialog) {
      setClose(true);
    }
    setTimeout(() => setClose(false), 2000);
  }, [closeDialog]);

  return (
    <DialogComponent
      headerTitle={dialogTitle}
      close={close}
      headerDescription={dialogDescription}
      footer={footer}
      disabled={disabled}
      maxWidth={maxwidth}
      trigger={
        trigger ? (
          trigger
        ) : controlType === "edit" ? (
          <Button
            disabled={disabled}
            // size="icon"
            className="bg-rx-secondary rounded-full text-xs text-rx-secondary-foreground"
          >
            <Edit className="w-2 h-2" />
            Edit
          </Button>
        ) : controlType === "add" ? (
          <Button
            disabled={disabled}
            className="bg-rx-primary text-xs rounded-full text-rx-primary-foreground"
          >
            <Plus className="md:h-4 h-3" /> Add
          </Button>
        ) : (
          <Button
            disabled={disabled}
            className="hover:bg-muted/60 hover:text-muted-foreground bg-destructive text-destructive-foreground"
          >
            <Trash2 /> Delete
          </Button>
        )
      }
    >
      <ScrollArea className="max-h-[80vh]">{children}</ScrollArea>
    </DialogComponent>
  );
};

export default ActionDialog;
