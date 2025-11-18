import { type ReactNode } from "react";
import { Controller, type Path } from "react-hook-form";
import Select, {
  type ActionMeta,
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";

export interface DropDownOption<T = string | number> {
  value: T;
  label: ReactNode;
}

interface DropDownComponentProps<T = string | number> {
  label: ReactNode;
  options: DropDownOption<T>[];
  required?: boolean;
  onChanged?: (
    value: SingleValue<DropDownOption<T>>,
    actionMeta?: ActionMeta<DropDownOption<T>>
  ) => void;
  width?: string;
  title?: string;
  controlBgColor?: string;
  borderColor?: string;
  primaryColor?: string;
  primaryColor25?: string;
  optionsActiveBgColor?: string;
  controlColor?: string;
  emptyMessage?: string;
  disabled?: boolean;
  name?: Path<T> | string;
  borderRadius?: string;
  optionsColor?: string;
  optionActiveColor?: string;
  defaultValue?: DropDownOption<T>;
  control?: any; // from react-hook-form
  formatOptionLabel?: (option: DropDownOption<T>) => ReactNode;
  isClearable?: boolean;
  height?: string;
  fontSize?: string;
  handleInputChange?: (value: string) => void;
  isLoading?: boolean;
  zIndex?: number; // New prop for custom z-index
}

const DropDownComponent = <T,>({
  label,
  options,
  onChanged,
  width = "100%",
  controlBgColor,
  borderColor,
  disabled,
  required,
  title,
  optionsActiveBgColor,
  controlColor,
  borderRadius,
  optionsColor,
  optionActiveColor,
  control,
  name,
  defaultValue,
  formatOptionLabel,
  isClearable,
  height,
  fontSize,
  handleInputChange,
  isLoading,
  zIndex = 9999, // Default high z-index
}: DropDownComponentProps<T>) => {
  const styles: StylesConfig<
    DropDownOption<T>,
    false,
    GroupBase<DropDownOption<T>>
  > = {
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--rx-secondary)",
      color: "var(--rx-secondary-foreground)",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      borderRadius: "5px",
      zIndex: zIndex, // Use the configurable z-index
    }),
    // CRITICAL FIX: Set z-index for menuPortal
    menuPortal: (base) => ({
      ...base,
      zIndex: zIndex, // This is the most important fix
      color: "var(--on-card)",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
      color: "var(--on-surface)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
      color: controlColor ?? "var(--on-surface)",
      fontWeight: "semibold",
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      fontSize: "12px",
      color:
        optionsColor ??
        (state.isSelected ? "var(--on-card)" : "var(--on-surface)"),
      "&:active": {
        backgroundColor: optionsActiveBgColor ?? "var(--card)",
        color: optionActiveColor ?? "var(--on-card)",
      },
      // Ensure option is clickable
      pointerEvents: "auto",
    }),
    input: (base) => ({
      ...base,
      color: "var(--on-surface)",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--on-surface)",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      color: "var(--on-surface)",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--on-surface)",
    }),
    control: (baseStyles) => ({
      ...baseStyles,
      borderRadius: borderRadius ?? "10px",
      height: height ? height : "39px",
      border: "1px solid #e9e9e9",
      borderColor: required
        ? "var(--error)"
        : borderColor
        ? borderColor
        : "transparent",
      borderWidth: required ? "3px" : "2px",
      fontSize: fontSize ? fontSize : "12px",
      color: controlColor ?? "var(--on-surface)",
      backgroundColor: controlBgColor ?? "var(--surface)",
      width: width ?? "max-content",
    }),
  };

  // Common Select props to avoid repetition
  const commonSelectProps = {
    menuPosition: "fixed" as const,
    menuPortalTarget: document.body,
    isDisabled: disabled,
    theme: (theme: any) => ({
      ...theme,
      borderRadius: 0,
      border: 1,
      cursor: disabled ? "not-allowed" : "pointer",
      colors: {
        ...theme.colors,
        primary25: "#adadaa",
        primary: "#444444",
      },
    }),
    styles,
    options,
    placeholder: label,
    formatOptionLabel: (option: DropDownOption<T>, { context }: any) =>
      formatOptionLabel
        ? context === "menu"
          ? formatOptionLabel(option)
          : option.label
        : option.label,
    getOptionLabel: (option: DropDownOption<T>) =>
      option.label?.toString() || "",
    isLoading: isLoading ? isLoading : undefined,
    onInputChange: handleInputChange,
  };

  return (
    <div
      className={disabled ? "opacity-50 cursor-not-allowed" : ""}
      style={{ position: "relative", zIndex: 1 }}
    >
      {title && (
        <p className="text-xs">
          {title} {required && <span className="text-destructive ml-1">*</span>}
        </p>
      )}
      {control ? (
        <Controller
          name={name || ""}
          control={control}
          defaultValue={defaultValue || null}
          render={(field) => (
            <Select
              {...commonSelectProps}
              isClearable={isClearable ? isClearable : true}
              value={field.field.value}
              onChange={(val, actionMeta) => {
                field.field.onChange(val);
                onChanged?.(val, actionMeta);
              }}
            />
          )}
        />
      ) : (
        <Select
          {...commonSelectProps}
          isClearable={isClearable ? isClearable : false}
          value={defaultValue}
          name={name}
          onChange={(val, actionMeta) => onChanged?.(val, actionMeta)}
        />
      )}
    </div>
  );
};

export default DropDownComponent;
