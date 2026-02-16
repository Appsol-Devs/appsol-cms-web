import { Ban, Check, Info } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

const toastStyles = {
  success: {
    backgroundColor: "#0E9F6E",
    color: "#ffffff",
    className: "!bg-primary !text-primary-foreground",
  },
  error: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    className: "!bg-red-600 !text-white",
  },
  info: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    className: "!bg-blue-600 !text-white",
  },
};

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

  const styleConfig = toastStyles[type];

  return toast(title, {
    className: `w-[100px] border-2 ${styleConfig.className}`,
    description: message,
    closeButton: true,
    style: {
      width: "max-content",
      minWidth: "200px",
      border: "none",
      backgroundColor: styleConfig.backgroundColor,
      color: styleConfig.color,
    },
    icon: icon,
    duration: duration,
    id: message,
  });
}
