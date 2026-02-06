import { type ReactNode } from "react";
import { Controller } from "react-hook-form"; // Removed Path from import
import Select, {
  type ActionMeta,
  type GroupBase,
  type MultiValue,
  type StylesConfig,
} from "react-select";

export interface DropDownOption<T = string | number> {
  value: T;
  label: ReactNode;
}

interface MultiSelectorComponentProps<T = string | number> {
  label: ReactNode;
  options: DropDownOption<T>[];
  required?: boolean;
  onChanged?: (
    value: MultiValue<DropDownOption<T>>,
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
  name?: string; // FIXED: Changed from Path<T> | string to just string
  borderRadius?: string;
  optionsColor?: string;
  optionActiveColor?: string;
  defaultValue?: DropDownOption<T>[];
  control?: any;
  formatOptionLabel?: (option: DropDownOption<T>) => ReactNode;
  isClearable?: boolean;
  height?: string;
  fontSize?: string;
  handleInputChange?: (value: string) => void;
  isLoading?: boolean;
  zIndex?: number;
  placeholder?: string;
}

const MultiSelectorComponent = <T,>({
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
  isClearable = true,
  height,
  fontSize,
  handleInputChange,
  isLoading,
  zIndex = 9999,
  placeholder = "Select...",
}: MultiSelectorComponentProps<T>) => {
  const styles: StylesConfig<
    DropDownOption<T>,
    true,
    GroupBase<DropDownOption<T>>
  > = {
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--rx-secondary)",
      color: "var(--rx-secondary-foreground)",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      borderRadius: "5px",
      zIndex: zIndex,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: zIndex,
      color: "var(--on-card)",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
      color: "var(--on-surface)",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: optionsActiveBgColor ?? "var(--surface-border)",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "12px",
      color: controlColor ?? "var(--on-surface)",
      fontWeight: "500",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--on-surface)",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "var(--destructive)",
        color: "white",
      },
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      fontSize: "12px",
      color:
        optionsColor ??
        (state.isSelected ? "var(--on-card)" : "var(--on-surface)"),
      backgroundColor: state.isSelected
        ? "var(--primary)"
        : base.backgroundColor,
      "&:active": {
        backgroundColor: optionsActiveBgColor ?? "var(--card)",
        color: optionActiveColor ?? "var(--on-card)",
      },
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
      minHeight: height ? height : "39px",
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

  const commonSelectProps = {
    menuPosition: "fixed" as const,
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    isDisabled: disabled,
    isMulti: true as const,
    closeMenuOnSelect: false,
    hideSelectedOptions: false,
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
    placeholder: label || placeholder,
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
        <p className="text-xs mb-1">
          {title} {required && <span className="text-destructive ml-1">*</span>}
        </p>
      )}
      {control && name ? (
        <Controller
          name={name as any} 
          control={control}
          defaultValue={defaultValue ?? [] as any}
          render={({ field }) => (
            <Select
              {...commonSelectProps}
              isClearable={isClearable}
              value={field.value as unknown as MultiValue<DropDownOption<T>>}
              onChange={(val, actionMeta) => {
                field.onChange(val);
                onChanged?.(val, actionMeta);
              }}
            />
          )}
        />
      ) : (
        <Select
          {...commonSelectProps}
          isClearable={isClearable}
          value={defaultValue}
          name={name}
          onChange={(val, actionMeta) => onChanged?.(val, actionMeta)}
        />
      )}
    </div>
  );
};

export default MultiSelectorComponent;