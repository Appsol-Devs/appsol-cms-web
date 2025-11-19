import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState, type ReactNode } from "react";

interface IDialog {
  headerTitle: string;
  headerDescription?: string;
  footer?: ReactNode;
  children: ReactNode;
  trigger: ReactNode;
  disableOutsideClick?: boolean;
  disabled?: boolean;
  close?: boolean; // External control prop
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "fullscreen"; // Dynamic width options
}

export default function DialogComponent({
  headerTitle,
  headerDescription,
  trigger,
  children,
  footer,
  disableOutsideClick = true,
  disabled,
  close,
  maxWidth = "md", // Default size
}: IDialog) {
  const [isOpen, setIsOpen] = useState(false);

  // Sync external close prop with internal state
  useEffect(() => {
    if (close) {
      setIsOpen(!close);
    }
  }, [close]);

  // Map maxWidth prop to Tailwind width classes
  const widthClasses: Record<string, string> = {
    xs: "max-w-[300px]",
    sm: "max-w-[425px]",
    md: "max-w-[600px]",
    lg: "max-w-[800px]",
    xl: "max-w-[1024px]",
    fullscreen: "w-full h-full max-w-none", // Fullscreen support
  };

  return (
    <Dialog
      modal
      open={isOpen}
      defaultOpen
      onOpenChange={!disabled ? setIsOpen : () => {}}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        onInteractOutside={
          disableOutsideClick ? (e) => e.preventDefault() : undefined
        }
        className={`${widthClasses[maxWidth]} sm:rounded-lg`}
      >
        <DialogHeader>
          <DialogTitle>{headerTitle}</DialogTitle>
          <DialogDescription>{headerDescription}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
