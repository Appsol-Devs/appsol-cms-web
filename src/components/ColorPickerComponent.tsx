import { Controller, type Control } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  control: Control<any>;
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const PRESET_COLORS = [
  { row: 1, color: "#EF4444" }, 
  { row: 1, color: "#F97316" }, 
  { row: 1, color: "#EAB308" },
  { row: 1, color: "#A855F7" },
  { row: 1, color: "#3B82F6" },
  { row: 2, color: "#D4A574" },
  { row: 2, color: "#6B7280" },
  { row: 2, color: "#14B8A6" },
  { row: 2, color: "#22C55E" },
];

export function ColorPickerComponent({
  control,
  name,
  label,
  disabled = false,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("leading-3", className)}>
      {label && (
        <Label htmlFor={name} className="text-xs text-onCard mb-2 block">
          {label}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {PRESET_COLORS.filter((item) => item.row === 1).map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && field.onChange(item.color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                      field.value === item.color
                        ? "border-black border-[3px]"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: item.color }}
                    aria-label={`Select color ${item.color}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {PRESET_COLORS.filter((item) => item.row === 2).map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && field.onChange(item.color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                      field.value === item.color
                        ? "border-black border-[3px]"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: item.color }}
                    aria-label={`Select color ${item.color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
