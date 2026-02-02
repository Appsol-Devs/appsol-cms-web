import { Controller, type Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

const SWITCH_CHECKED_COLOR = "#16a34a";

interface CustomSwitchComponentProps {
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
}: CustomSwitchComponentProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={!!field.value}
            onCheckedChange={field.onChange}
            className={className}
            style={
              field.value ? { backgroundColor: SWITCH_CHECKED_COLOR } : undefined
            }
            disabled={disabled}
          />
          {label && <label className="text-sm">{label}</label>}
        </div>
      )}
    />
  );
}
