import { Ban, Check, Info } from "lucide-react";
import { ReactNode } from "react";
import { toast } from "sonner";

export function showToast({
  type,
  message,
  title,
  duration = 2000,
}: {
  message: string;
  type: "error" | "success" | "info";
  title: string;
  duration?: number;
}) {
  const icon: ReactNode =
    type === "error" ? (
      <Ban className="w-5" />
    ) : type === "info" ? (
      <Info className="w-5" />
    ) : (
      <Check className="w-5" />
    );

  return toast(title, {
    className: "w-[100px] border-2",
    description: message,
    closeButton: true,
    style: {
      width: "max-content",
      minWidth: "200px",
      border: "none",
      backgroundColor: "var(--rx-primary)",
      color: "var(--rx-primary-foreground)",
    },
    icon: icon,
    duration: duration,
    // action: {
    //   label: "Close",
    //   onClick: () => console.log("Undo"),
    // },
    id: message,
  });
}
