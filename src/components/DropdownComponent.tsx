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
  options?: DropDownOption<T>[];
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
  isLoading?: boolean;
  zIndex?: number; // New prop for custom z-index
  onMenuOpen?: () => void;
}

const DropDownComponent = <T,>({
  label,
  options: optionsProp = [],
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
  isLoading: isLoadingProp,
  zIndex = 9999, // Default high z-index
  onMenuOpen: onMenuOpenProp,
}: DropDownComponentProps<T>) => {
  const options = optionsProp;
  const isLoading = isLoadingProp;
  const onMenuOpen = onMenuOpenProp;

  const styles: StylesConfig<
    DropDownOption<T>,
    false,
    GroupBase<DropDownOption<T>>
  > = {
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--popover)",
      color: "var(--popover-foreground)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      borderRadius: "var(--radius)",
      zIndex: zIndex,
      marginTop: "4px",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: zIndex,
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: fontSize ?? "12px",
      color: "var(--muted-foreground)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: fontSize ?? "12px",
      color: controlColor ?? "var(--foreground)",
      fontWeight: "500",
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      fontSize: fontSize ?? "12px",
      padding: "8px 12px",
      backgroundColor: state.isSelected
        ? optionsActiveBgColor ?? "var(--primary)"
        : state.isFocused
          ? "color-mix(in srgb, var(--primary) 12%, var(--popover))"
          : "transparent",
      color:
        optionsColor ??
        (state.isSelected
          ? optionActiveColor ?? "var(--on-primary)"
          : "var(--foreground)"),
      pointerEvents: "auto",
      "&:active": {
        backgroundColor: optionsActiveBgColor ?? "var(--primary)",
      },
    }),
    input: (base) => ({
      ...base,
      color: "var(--foreground)",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      padding: "0 8px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      padding: "0 4px",
    }),
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderRadius: borderRadius ?? "0.375rem",
      minHeight: height ?? "36px",
      fontSize: fontSize ?? "12px",
      color: controlColor ?? "var(--foreground)",
      backgroundColor: controlBgColor ?? "var(--surface)",
      width: width ?? "100%",
      border: "1px solid",
      borderColor: state.isFocused
        ? "var(--ring)"
        : required
          ? "var(--destructive)"
          : borderColor ?? "var(--input)",
      boxShadow: state.isFocused ? "0 0 0 2px var(--ring)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "&:hover": {
        borderColor: !state.isFocused && !required ? "var(--input)" : undefined,
      },
    }),
  };

  // Common Select props to avoid repetition
  const commonSelectProps = {
    menuPosition: "fixed" as const,
    menuPortalTarget: document.body,
    isDisabled: disabled,
    theme: (theme: any) => ({
      ...theme,
      borderRadius: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      colors: {
        ...theme.colors,
        primary: "var(--primary)",
        primary25: "var(--accent)",
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
    onMenuOpen,
  };

  return (
    <div
      className={`space-y-1 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ position: "relative", zIndex: 1 }}
    >
      {title && (
        <p className="text-xs text-onCard font-medium">
          {title} {required && <span className="text-destructive ml-0.5">*</span>}
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
