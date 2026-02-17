import { type ReactNode } from "react";
import { Controller } from "react-hook-form";
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
  label?: ReactNode;
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
  name?: string;
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
  control,
  name,
  defaultValue,
  formatOptionLabel,
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
      backgroundColor: "var(--rx-secondary, #ffffff)",
      color: "var(--rx-secondary-foreground, #333)",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      zIndex: zIndex,
      marginTop: "4px",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: zIndex,
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
      color: "var(--on-surface, #666)",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: optionsActiveBgColor ?? "var(--surface-border, #e5e7eb)",
      borderRadius: "20px",
      margin: "2px",
      display: "flex",
      alignItems: "center",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "12px",
      color: controlColor ?? "var(--on-surface, #333)",
      fontWeight: "500",
      padding: "2px 8px",
      paddingRight: "6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--on-surface, #555)",
      cursor: "pointer",
      borderRadius: "0 20px 20px 0",
      paddingLeft: "4px",
      paddingRight: "8px",
      ":hover": {
        backgroundColor: "var(--destructive, #ff4d4f)",
        color: "white",
      },
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      fontSize: "13px",
      color:
        optionsColor ??
        (state.isSelected ? "var(--on-card, #fff)" : "var(--on-surface, #333)"),
      backgroundColor: state.isSelected
        ? "var(--primary, #3b82f6)"
        : base.backgroundColor,
      "&:active": {
        backgroundColor: optionsActiveBgColor ?? "var(--card, #f3f4f6)",
      },
    }),
    input: (base) => ({
      ...base,
      color: "var(--on-surface, #333)",
      margin: "0px",
      padding: "0px",
    }),
    control: (baseStyles) => ({
      ...baseStyles,
      borderRadius: borderRadius ?? "10px",
      minHeight: height ? height : "38px",
      height: "auto",
      border: "1px solid #e9e9e9",
      borderColor: required
        ? "var(--error, red)"
        : borderColor
        ? borderColor
        : "#e2e8f0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "var(--primary, #3b82f6)",
      },
      fontSize: fontSize ? fontSize : "12px",
      color: controlColor ?? "var(--on-surface)",
      backgroundColor: controlBgColor ?? "var(--surface, white)",
      width: width,
      flexWrap: "wrap",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
      gap: "4px",
    }),
  };

  const commonSelectProps = {
    menuPosition: "fixed" as const,
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    isDisabled: disabled,
    isMulti: true as const,
    closeMenuOnSelect: false,
    hideSelectedOptions: false,
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

  const ClearAllLink = ({ onClick }: { onClick: () => void }) => (
    <div className="flex justify-end mt-1">
      <span
        onClick={onClick}
        className="text-xs font-medium text-red-500 cursor-pointer hover:underline select-none"
      >
        Clear All
      </span>
    </div>
  );

  return (
    <div
      className={disabled ? "opacity-50 cursor-not-allowed" : ""}
      style={{ position: "relative", zIndex: 1, width: width }}
    >
      {title && (
        <p className="text-xs mb-1 font-medium text-gray-700">
          {title} {required && <span className="text-red-500 ml-1">*</span>}
        </p>
      )}

      {control && name ? (
        <Controller
          name={name as any}
          control={control}
          defaultValue={(defaultValue ?? []) as any}
          render={({ field }) => {
            const currentValues = field.value as MultiValue<DropDownOption<T>>;
            const hasValues = currentValues && currentValues.length > 0;

            return (
              <>
                <Select
                  {...commonSelectProps}
                  isClearable={false}
                  value={currentValues}
                  onChange={(val, actionMeta) => {
                    field.onChange(val);
                    onChanged?.(val, actionMeta);
                  }}
                />
                {hasValues && !disabled && (
                  <ClearAllLink
                    onClick={() => {
                      field.onChange([]);
                      onChanged?.([], { action: "clear" } as any);
                    }}
                  />
                )}
              </>
            );
          }}
        />
      ) : (
        <>
          <Select
            {...commonSelectProps}
            isClearable={false}
            value={defaultValue}
            name={name}
            onChange={(val, actionMeta) => onChanged?.(val, actionMeta)}
          />
          {defaultValue && defaultValue.length > 0 && !disabled && (
            <ClearAllLink
              onClick={() => {
                onChanged?.([], { action: "clear" } as any);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MultiSelectorComponent;