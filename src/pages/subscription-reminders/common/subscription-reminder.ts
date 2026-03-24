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

export function getDueDateTab(
  dueDateStr?: string,
): "overdue" | "due_today" | "upcoming" {
  if (!dueDateStr) return "upcoming";
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (dueDay.getTime() - today.getTime()) / 86400000,
  );
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due_today";
  return "upcoming";
}
