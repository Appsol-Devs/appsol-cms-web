import { Controller, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface RHCheckboxProps {
  control: Control<any>;
  name: string;
  label?: string;
  className?: string;
}

export function CheckboxComponent({
  control,
  name,
  label,
  className,
}: RHCheckboxProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center gap-2">
          <Checkbox
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
