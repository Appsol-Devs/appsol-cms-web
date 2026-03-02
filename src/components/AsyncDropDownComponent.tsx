import AsyncSelect from "react-select/async";
import type { GroupBase, SingleValue, StylesConfig } from "react-select";
import { Controller } from "react-hook-form";
import type { DropDownOption } from "./DropdownComponent";
import type { ReactNode } from "react";

interface AsyncDropDownComponentProps<T = string | number> {
  placeholder: string;
  label?: string;
  options: (
    val: string,
    callback?: (options: any) => void,
  ) => Promise<DropDownOption<T>[]>;
  onChanged?: (value: SingleValue<DropDownOption<T>>) => void;
  width?: string;
  height?: string;
  fontSize?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: DropDownOption<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: any; // from react-hook-form
  name?: string;
  formatOptionLabel?: (option: DropDownOption<T>) => ReactNode;
  handleInputChange?: (value: string) => void;
  zIndex?: number; // New prop for custom z-index
}

const AsyncDropDownComponent = <T,>({
  placeholder,
  options,
  onChanged,
  required,
  height,
  disabled,
  width,
  fontSize,
  label,
  control,
  name,
  defaultValue,
  formatOptionLabel,
  handleInputChange,
  zIndex = 9999,
}: AsyncDropDownComponentProps<T>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles: StylesConfig<any, false, GroupBase<any>> | undefined = {
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--popover)",
      color: "var(--popover-foreground)",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      borderRadius: "var(--radius)",
      zIndex,
      marginTop: "4px",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex,
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      fontSize: fontSize ?? "12px",
      padding: "8px 12px",
      backgroundColor: state.isSelected
        ? "var(--primary)"
        : state.isFocused
          ? "color-mix(in srgb, var(--primary) 12%, var(--popover))"
          : "transparent",
      color: state.isSelected ? "var(--on-primary)" : "var(--foreground)",
      pointerEvents: "auto",
      "&:active": {
        backgroundColor: "var(--primary)",
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
    indicatorSeparator: (base) => ({
      ...base,
      display: "none",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      padding: "0 4px",
    }),
    container: (base) => ({
      ...base,
      fontSize: fontSize ?? "12px",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: fontSize ?? "12px",
      color: "var(--muted-foreground)",
    }),

    singleValue: (base) => ({
      ...base,
      fontSize: fontSize ?? "12px",
      color: "var(--foreground)",
      fontWeight: "500",
    }),
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderRadius: "0.375rem",
      minHeight: height ?? "36px",
      fontSize: fontSize ?? "12px",
      color: "var(--foreground)",
      backgroundColor: "var(--surface)",
      width: width ?? "100%",
      border: "1px solid",
      borderColor: state.isFocused
        ? "var(--ring)"
        : required
          ? "var(--destructive)"
          : "var(--input)",
      boxShadow: state.isFocused
        ? "0 0 0 2px var(--ring)"
        : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "&:hover": {
        borderColor: !state.isFocused && !required ? "var(--input)" : undefined,
      },
    }),
  };
  return (
    <div
      className={`space-y-1 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ position: "relative", zIndex: 1 }}
    >
      {label && (
        <p className="text-xs text-onCard font-medium">
          {label} {required && <span className="text-destructive ml-0.5">*</span>}
        </p>
      )}
      {control ? (
        <Controller
          name={name || ""}
          control={control}
          defaultValue={defaultValue || null}
          render={(field) => (
            <AsyncSelect
              cacheOptions={false}
              menuPosition="fixed"
              menuPortalTarget={document.body}
              isDisabled={disabled}
              onInputChange={handleInputChange}
              getOptionLabel={(option) => option.label?.toString() || ""}
              formatOptionLabel={(option, { context }) =>
                formatOptionLabel
                  ? context === "menu"
                    ? formatOptionLabel(option)
                    : option.label
                  : option.label
              }
              isClearable={true}
              required={required}
              value={field.field.value}
              loadOptions={options}
              onChange={(val) => {
                field.field.onChange(val);
                onChanged?.(val as SingleValue<DropDownOption<T>>);
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 8,
                cursor: disabled ? "not-allowed" : "pointer",
                colors: {
                  ...theme.colors,
                  primary: "var(--primary)",
                  primary25: "var(--accent)",
                },
              })}
              styles={styles}
              placeholder={placeholder}
            />
          )}
        />
      ) : (
        <AsyncSelect
          cacheOptions
          menuPosition="fixed"
          menuPortalTarget={document.body}
          isClearable
          isDisabled={disabled}
          required={required}
          getOptionLabel={(option) => option.label?.toString() || ""}
          formatOptionLabel={(option, { context }) =>
            formatOptionLabel
              ? context === "menu"
                ? formatOptionLabel(option)
                : option.label
              : option.label
          }
          loadOptions={options}
          onChange={(val) => {
            onChanged?.(val as SingleValue<DropDownOption<T>>);
          }}
          theme={(theme) => ({
            ...theme,
            borderRadius: 8,
            cursor: disabled ? "not-allowed" : "pointer",
            colors: {
              ...theme.colors,
              primary: "var(--primary)",
              primary25: "var(--accent)",
            },
          })}
          styles={styles}
          placeholder={placeholder}
        />
      )}
      {required && (
        <p className="text-xs text-error mt-0.5">Please select an option</p>
      )}
    </div>
  );
};

export default AsyncDropDownComponent;

