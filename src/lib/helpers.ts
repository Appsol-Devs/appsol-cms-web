import type { DropDownOption } from "@/components/DropdownComponent";
import { format, formatDistanceToNow } from "date-fns";
import { useCallback, useRef } from "react";
import type {
  DefaultValues,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

const DEBOUNCE_MS = 300;

export const debounceAsync = <T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number,
) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        try {
          const result = await callback(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};
export function useDebouncedSearch(
  fn: (search: string) => void,
  delayMs: number = DEBOUNCE_MS,
): (search: string) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback(
    (search: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        fnRef.current(search);
      }, delayMs);
    },
    [delayMs],
  );
}

export const formatToCurrency = (value: number) => {
  return new Intl.NumberFormat("gh-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const findActiveDropdownOption = (
  value?: string | number,
  options?: DropDownOption[],
) => {
  if (value && options) {
    const active = options.find((option) => option.value === value);
    return active?.label;
  }
  return "";
};

export const generateRandomColor = (): string => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
};

export const useGenerateDropdownOptionsFromEnum = <
  T extends Record<string, string | number>,
>(
  enumObject: T,
): DropDownOption[] => {
  return Object.entries(enumObject)
    .filter(([key]) => isNaN(Number(key))) // removes reverse mapping ONLY when present
    .map(([key, value]) => ({
      label: key,
      value,
    }));
};

export const useGenerateDropdownOptions = <T extends Record<string, string>>(
  dataArray: T[],
  labelKey: string,
  valueKey: string,
): DropDownOption[] => {
  return dataArray.map((data) => ({
    label: data[labelKey],
    value: data[valueKey],
  }));
};

export const cleanPayload = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== "" && v !== undefined && v !== null,
    ),
  );
};

export const resetMutationForm = <T extends FieldValues>(
  form: UseFormReturn<T>,
  values: DefaultValues<T>,
) => {
  form.reset(values, { keepDefaultValues: true });
};

export const filterFieldToValue = (val: unknown): string | undefined => {
  if (val == null || val === "") return undefined;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val !== "object") return undefined;

  if ("value" in val) {
    const inner = (val as DropDownOption<unknown>).value;
    if (inner == null || inner === "") return undefined;
    if (typeof inner === "string" || typeof inner === "number") {
      return String(inner);
    }
    if (
      typeof inner === "object" &&
      inner !== null &&
      "_id" in inner &&
      (inner as { _id?: string })._id
    ) {
      return String((inner as { _id: string })._id);
    }
  }

  if ("_id" in val && (val as { _id?: string })._id) {
    return String((val as { _id: string })._id);
  }

  return undefined;
};

export const dropdownValueToDisplayLabel = (
  val?: string | number | DropDownOption<string | number> | null,
  options?: DropDownOption<string | number>[],
): string | undefined => {
  if (val == null || val === "") return undefined;
  if (typeof val === "object" && "label" in val) {
    const label = val.label?.toString();
    if (label) return label;
    val = val.value;
  }
  const strVal = String(val);
  const match = options?.find((o) => String(o.value) === strVal);
  if (match?.label != null) return match.label.toString();
  return strVal;
};

export function formatToTimeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export const formatDate = (date?: Date | string) => {
  if (!date) return "N/A";
  return format(new Date(date), "do MMM y h:mm a").replace(
    /\s(AM|PM)$/i,
    (_, m) => m.toLowerCase(),
  );
};

export const formatDateTime = (date?: Date | string) => {
  if (!date) return "—";
  return format(new Date(date), "do MMM y h:mm a").replace(
    /\s(AM|PM)$/i,
    (_, m) => m.toLowerCase(),
  );
};

export const formatMutationSummaryDateTime = (
  date?: Date | string | null,
): string => {
  if (date == null) return "";
  const raw = typeof date === "string" ? date : date;
  if (!String(raw).trim()) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return typeof date === "string" ? date : "";
  const datePart = format(d, "do MMM y");
  const hasTime =
    d.getHours() !== 0 ||
    d.getMinutes() !== 0 ||
    d.getSeconds() !== 0 ||
    d.getMilliseconds() !== 0;
  if (!hasTime) return datePart;
  const timePart = format(d, "h:mm a").replace(/\s+(AM|PM)$/i, (_, ap) =>
    ap.toLowerCase(),
  );
  return `${datePart}, ${timePart}`;
};

export const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U"; // "U" as default if no name
};

export const FEATURE_STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  "under-review": "#f97316",
  planned: "#8b5cf6",
  complete: "#22c55e",
  rejected: "#e11d48",
};

export const FEATURE_PRIORITY_COLORS: Record<string, string> = {
  critical: "#b91c1c",
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#64748b",
};
