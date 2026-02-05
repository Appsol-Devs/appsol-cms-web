import { Controller, type Control } from "react-hook-form";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RHSwitchProps {
  control: Control<any>;
  name: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSwitchComponent({
  control,
  name,
  label,
  className,
  disabled = false,
}: RHSwitchProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const checked = !!field.value;
        return (
          <div className="flex items-center gap-2">
            <SwitchPrimitive.Root
              checked={checked}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-gray-200 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700",className)}>
              <span className={cn("absolute left-1 flex size-4 items-center justify-center", !checked ? "text-gray-400" : "text-transparent")}>
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              <span className={cn("absolute right-1 flex size-4 items-center justify-center", checked ? "text-gray-400" : "text-transparent")}>
                <X className="size-2.5" strokeWidth={3} />
              </span>
              <SwitchPrimitive.Thumb className="pointer-events-none absolute left-0.5 flex size-4 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-0 data-[state=unchecked]:translate-x-6">
                {checked ? (
                  <Check className="size-2.5 text-primary" strokeWidth={3} />
                ) : (
                  <X className="size-2.5 text-foreground" strokeWidth={3} />
                )}
              </SwitchPrimitive.Thumb>
            </SwitchPrimitive.Root>
            {label && <label className="text-sm">{label}</label>}
          </div>
        );
      }}
    />
  );
}
