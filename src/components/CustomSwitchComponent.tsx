import { Controller, type Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

interface RHSwitchProps {
  control: Control<any>;
  name: string;
  label?: string;
  className?: string;
}

export function CustomSwitchComponent({
  control,
  name,
  label,
  className,
}: RHSwitchProps) {
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
          />
          {label && <label className="text-sm">{label}</label>}
        </div>
      )}
    />
  );
}
