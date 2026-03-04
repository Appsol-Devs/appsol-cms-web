import type { DropDownOption } from "@/components/DropdownComponent";
import { format, formatDistanceToNow } from "date-fns";
import { useCallback, useRef } from "react";

const DEBOUNCE_MS = 300;

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

export const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U"; // "U" as default if no name
};
