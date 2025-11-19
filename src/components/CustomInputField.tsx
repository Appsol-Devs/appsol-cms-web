import { ErrorMessage } from "@hookform/error-message";
import { type VariantProps, cva } from "class-variance-authority";
import classNames from "classnames";
import type {
  FC,
  InputHTMLAttributes,
  LegacyRef,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { InputPassword } from "./ui/input-password";
import type {
  Control,
  DeepMap,
  FieldError,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

const inputVariance = cva(
  [
    // "dark:bg-transparent",
    "rounded-inherit",
    "outline-none",
    "text-onSurface",
    "border-0",
    "bg-surface",
    "w-full",
    "font-normal",
  ],
  {
    variants: {
      intent: {
        primary: ["p-1", "h-7", "bg-inherit"],
      },
      variantSize: {
        small: ["text-xs", "h-9", "py-1", "px-2"],
        medium: ["text-base", "py-1", "px-2"],
      },
    },
    defaultVariants: {
      intent: "primary",
      variantSize: "small",
    },
  }
);

interface CustomInputFiledProps<T extends Record<string, unknown>>
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariance> {
  width?: string;
  suffixIcon?: ReactNode;
  prefixIcon?: ReactNode;
  backgroundColor?: string;
  label?: string;
  customClass?: string;
  register?: UseFormRegister<T>;
  name?: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors?: Partial<DeepMap<T, FieldError>>;
  multipleLines?: boolean;
  isSwitch?: boolean;
  rows?: number;
  cols?: number;
  hideBorder?: boolean;
  ref?: LegacyRef<HTMLInputElement>;
  control?: Control<T>;
}

const CustomInputField = <T extends Record<string, unknown>>({
  customClass,
  variantSize,
  intent,
  width,
  prefixIcon,
  suffixIcon,
  backgroundColor,
  label,
  className,
  register,
  name,
  isSwitch,
  rules,
  errors,
  multipleLines,
  rows,
  cols,
  // hideBorder,
  ref,
  type,
  required,
  control,
  ...props
}: CustomInputFiledProps<T>) => {
  const hasError = errors && (name! in errors! ? true : false);

  return (
    <div className={cn("leading-3", customClass)}>
      <Label htmlFor={name} className="text-xs text-onCard">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div
      // className={cn(
      //   "flex justify-center items-center",
      //   // hideBorder ? "border border-transparent" : "border-solid",
      //   hasError ? "border-error border" : "",
      //   "rounded-xl bg-surface h-10 transition transition-border-color duration-300 ease-in-out",
      //   backgroundColor ? `bg-[${backgroundColor}]` : ""
      // )}
      >
        {prefixIcon && prefixIcon}
        {multipleLines ? (
          <div className={`my-0.5 w-full`}>
            <Textarea
              className={
                "w-full text-xs text-onSurface font-semibold py-1 px-2 outline-none ring-2 ring-outline bg-surface"
              }
              rows={rows || 2}
              cols={cols}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
              {...(register && register(name!, rules))}
            ></Textarea>
          </div>
        ) : (
          <>
            {type?.toLowerCase() === "password" ? (
              <div className={`w-full my-0.5`}>
                <InputPassword
                  id={name}
                  ref={ref}
                  className={classNames(
                    cn(
                      "ring-2 ring-outline h-10",
                      inputVariance({ intent, variantSize, className })
                    )
                  )}
                  {...props}
                  {...(register && register(name!, rules))}
                />
              </div>
            ) : (
              <div className={`w-full my-0.5`}>
                <Input
                  id={name}
                  ref={ref}
                  className={classNames(
                    cn(
                      "ring-2 ring-outline",
                      inputVariance({ intent, variantSize, className })
                    )
                  )}
                  type={type}
                  {...props}
                  {...(register && register(name!, rules))}
                />
              </div>
            )}
          </>
        )}
        {suffixIcon && suffixIcon}
      </div>
      <div
        className={classNames(
          "overflow-hidden transition-all duration-400 ease-in-out",
          {
            "max-h-16 opacity-100": hasError,
            "max-h-0 opacity-40": !hasError,
          }
        )}
      >
        {hasError && (
          <ErrorMessage
            errors={errors}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={name as any}
            render={({ message }) => (
              <FormErrorMessage
                className={classNames(
                  "mt-1 text-red-500",
                  hasError && "animate-bounceOnce"
                )}
              >
                {message}
              </FormErrorMessage>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default CustomInputField;

export type FormErrorMessageProps = {
  className?: string;
  children: ReactNode;
};

export const FormErrorMessage: FC<FormErrorMessageProps> = ({
  children,
  className,
}) => (
  <div
    className={classNames(
      "text-xs text-left block text-[#7c2424] font-semibold transition-all",
      className
    )}
  >
    {children}
  </div>
);
