import type { ICustomer } from "@/pages/customer/common/customers";
import type { IPayment } from "@/pages/payments/common/payments";
import type { ISoftware } from "@/pages/settings/common/settings";
import type { ISubscription } from "@/pages/subscriptions/common/subscriptions";

export type TSubscriptionReminderType =
  | "30_days"
  | "14_days"
  | "7_days"
  | "due_today"
  | "overdue";

export interface ISubscriptionReminder {
  _id?: string;
  reminderCode?: string;
  title?: string;

  customerId?: string;
  customer?: ICustomer;

  softwareId?: string;
  software?: ISoftware;
  payment?: IPayment;

  subscriptionId?: string;
  subscription?: ISubscription;

  dueDate?: string;
  isSent?: boolean;
  reminderType?: TSubscriptionReminderType;
  sentVia?: "email" | "notification" | "sms";

  createdAt?: string;
  updatedAt?: string;
}

export const SUBSCRIPTION_REMINDER_TYPE_LABELS: Record<
  TSubscriptionReminderType,
  string
> = {
  "30_days": "30 days",
  "14_days": "14 days",
  "7_days": "7 days",
  due_today: "Due today",
  overdue: "Overdue",
};

export function formatReminderTypeLabel(
  type?: TSubscriptionReminderType,
): string {
  if (!type) return "N/A";
  return SUBSCRIPTION_REMINDER_TYPE_LABELS[type] ?? type;
}

function pluralUnit(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

export function formatDurationFromDays(totalDays: number): string {
  const abs = Math.abs(Math.round(totalDays));
  if (abs <= 30) return pluralUnit(abs, "day");

  let remaining = abs;
  const months = Math.floor(remaining / 30);
  remaining %= 30;
  const weeks = Math.floor(remaining / 7);
  const days = remaining % 7;

  const parts: string[] = [];
  if (months > 0) parts.push(pluralUnit(months, "month"));
  if (weeks > 0) parts.push(pluralUnit(weeks, "week"));
  if (days > 0) parts.push(pluralUnit(days, "day"));

  return parts.join(", ");
}

const DAYS_AGO_PATTERN = /(\d+)\s+days?\s+ago/i;
const IN_DAYS_PATTERN = /\bin\s+(\d+)\s+days?\b/i;

/** Rewrites API reminder titles so long day counts read as months, weeks, and days. */
export function formatReminderTitle(title?: string): string {
  if (!title) return "—";

  const daysAgoMatch = title.match(DAYS_AGO_PATTERN);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10);
    if (days > 30) {
      return title.replace(DAYS_AGO_PATTERN, `${formatDurationFromDays(days)} ago`);
    }
    return title;
  }

  const inDaysMatch = title.match(IN_DAYS_PATTERN);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    if (days > 30) {
      return title.replace(IN_DAYS_PATTERN, `in ${formatDurationFromDays(days)}`);
    }
  }

  return title;
}

export function getDueDateUrgency(
  dueDateStr?: string,
): "overdue" | "soon" | "normal" {
  if (!dueDateStr) return "normal";
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = diffMs / 86400000;
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "soon";
  return "normal";
}

function startOfDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function startOfDayDate(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDayDate(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDaysDate(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function reminderTypeFromDueDate(
  dueDateStr?: string,
  now: Date = new Date(),
): TSubscriptionReminderType | null {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  const dueMs = startOfDayMs(due);
  if (Number.isNaN(dueMs)) return null;

  const todayMs = startOfDayMs(now);
  const diffDays = Math.round((dueMs - todayMs) / 86400000);

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due_today";
  if (diffDays <= 7) return "7_days";
  if (diffDays <= 14) return "14_days";
  if (diffDays <= 30) return "30_days";
  return null;
}

export function dueDateRangeForReminderType(
  type?: TSubscriptionReminderType | string,
  now: Date = new Date(),
): { startDate?: string; endDate?: string } | null {
  if (!type) return null;

  const todayStart = startOfDayDate(now);
  const todayEnd = endOfDayDate(now);

  switch (type as TSubscriptionReminderType) {
    case "overdue": {
      const end = endOfDayDate(addDaysDate(todayStart, -1));
      return { endDate: end.toISOString() };
    }
    case "due_today":
      return {
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
      };
    case "7_days": {
      const start = startOfDayDate(addDaysDate(todayStart, 1));
      const end = endOfDayDate(addDaysDate(todayStart, 7));
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "14_days": {
      const start = startOfDayDate(addDaysDate(todayStart, 1));
      const end = endOfDayDate(addDaysDate(todayStart, 14));
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "30_days": {
      const start = startOfDayDate(addDaysDate(todayStart, 1));
      const end = endOfDayDate(addDaysDate(todayStart, 30));
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    default:
      return null;
  }
}
