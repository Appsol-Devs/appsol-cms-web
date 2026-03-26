export enum COMPLAINT_STATUS_ENUM {
  Open = "open",
  "In Progress" = "in-progress",
  Resolved = "resolved",
  Closed = "closed",
  Rescheduled = "rescheduled",
}

export enum BASE_STATUS_ENUM {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum PAYMENT_STATUS_ENUM {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
export const COMPLAINT_STATUS_COLORS: Record<string, string> = {
  open: "#ef4444",
  "in-progress": "#f97316",
  rescheduled: "#eab308",
  resolved: "#22c55e",
  closed: "#6b7280",
};

export const getComplaintStatusColor = (status?: string) =>
  status
    ? (COMPLAINT_STATUS_COLORS[status.toLowerCase()] ?? undefined)
    : undefined;

export enum LEAD_PRIORITY_ENUM {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum REQUEST_FEATURE_PRIORITY_ENUM {
  low = "low",
  medium = "medium",
  high = "high",
  critical = "critical",
}

export enum REQUEST_FEATURE_STATUS_ENUM {
  NEW = "new",
  "UNDER REVIEW" = "under-review",
  PLANNED = "planned",
  COMPLETE = "complete",
  REJECTED = "rejected",
}

export const LEAD_PRIORITY_COLORS: Record<string, string> = {
  low: "#0E9F6E",
  medium: "#F97316",
  high: "#EF4444",
};

export const getLeadPriorityColor = (priority?: string) =>
  priority
    ? (LEAD_PRIORITY_COLORS[priority.toLowerCase()] ?? undefined)
    : undefined;

export enum LEAD_STATUS_ENUM {
  NEW = "new",
  EVALUATING = "evaluating",
  BUILDING_PROPOSAL = "buildingProposal",
  QUALIFIED = "qualified",
  NEGOTIATION = "negotiation",
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "#3B82F6",
  evaluating: "#E65100",
  buildingproposal: "#64748B",
  qualified: "#22C55E",
  negotiation: "#EF4444",
  closed: "#16A34A",
  won: "#14B8A6",
};

export const getLeadStatusColor = (status?: string) =>
  status ? (LEAD_STATUS_COLORS[status.toLowerCase()] ?? undefined) : undefined;

export enum TICKET_PRIORITY_ENUM {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export const TICKET_PRIORITY_COLORS: Record<string, string> = {
  low: "#0E9F6E",
  medium: "#F97316",
  high: "#EF4444",
  urgent: "#7C3AED",
};

export const getTicketPriorityColor = (priority?: string) =>
  priority
    ? (TICKET_PRIORITY_COLORS[priority.toLowerCase()] ?? undefined)
    : undefined;

export const TICKET_STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",
  fixed: "#eab308",
  closed: "#22c55e",
  assigned: "#8b5cf6",
  rejected: "#ef4444",
};

export const getTicketStatusColor = (status?: string) =>
  status
    ? (TICKET_STATUS_COLORS[status.toLowerCase()] ?? undefined)
    : undefined;

export const getLookupBadgeStyle = (
  colorCode?: string,
):
  | { color: string; backgroundColor: string; borderColor: string }
  | undefined =>
  colorCode
    ? {
        color: colorCode,
        backgroundColor: `color-mix(in srgb, ${colorCode} 12%, transparent)`,
        borderColor: colorCode,
      }
    : undefined;

export enum CUSTOMER_OUTREACH_STATUS {
  PENDING = "pending",
  COMPLETED = "completed",
  RESCHEDULED = "rescheduled",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum SUBSCRIPTION_STATUS_ENUM {
  ACTIVE = "active",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  PENDING = "pending",
}

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  expired: "#6b7280",
  cancelled: "#ef4444",
  pending: "#f97316",
};

export const getSubscriptionStatusColor = (status?: string) =>
  status
    ? (SUBSCRIPTION_STATUS_COLORS[status.toLowerCase()] ?? undefined)
    : undefined;

export type DueStatus = "overdue" | "due-today" | "due-soon" | "upcoming";

export const DUE_STATUS_COLORS: Record<DueStatus, string> = {
  overdue: "#ef4444",
  "due-today": "#f97316",
  "due-soon": "#eab308",
  upcoming: "#22c55e",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "#f97316",
  approved: "#22c55e",
  rejected: "#ef4444",
};

export const getPaymentStatusColor = (status?: string) =>
  status
    ? (PAYMENT_STATUS_COLORS[status.toLowerCase()] ?? undefined)
    : undefined;

export const TARGET_ENTITY_TYPE_COLORS: Record<string, string> = {
  CustomerSetup: "#a855f7",
  Generic: "#94a3b8",
  Ticket: "#6366f1",
  CustomerOutreach: "#22c55e",
  CustomerComplaint: "#ef4444",
  SubscriptionReminder: "#ec4899",
};

export const getTargetEntityTypeColor = (type?: string) =>
  type ? (TARGET_ENTITY_TYPE_COLORS[type] ?? "#64748b") : undefined;

export const REMINDER_DELIVERY_COLORS = {
  sent: "#22c55e",
  notSent: "#6b7280",
} as const;

export const SUBSCRIPTION_AUTO_RENEW_COLORS = {
  auto: "#3b82f6",
  manual: "#64748b",
} as const;

export const getReminderDeliveryBadgeStyle = (
  isSent: boolean,
):
  | { color: string; backgroundColor: string; borderColor: string }
  | undefined =>
  getLookupBadgeStyle(
    isSent ? REMINDER_DELIVERY_COLORS.sent : REMINDER_DELIVERY_COLORS.notSent,
  );

export const getSubscriptionAutoRenewBadgeStyle = (
  autoRenew?: boolean,
):
  | { color: string; backgroundColor: string; borderColor: string }
  | undefined =>
  getLookupBadgeStyle(
    autoRenew
      ? SUBSCRIPTION_AUTO_RENEW_COLORS.auto
      : SUBSCRIPTION_AUTO_RENEW_COLORS.manual,
  );

export const getReminderDueUrgencyBadgeStyle = (
  urgency: "overdue" | "soon" | "normal",
):
  | { color: string; backgroundColor: string; borderColor: string }
  | undefined => {
  const color =
    urgency === "overdue"
      ? DUE_STATUS_COLORS.overdue
      : urgency === "soon"
        ? "#f97316"
        : "#64748b";
  return getLookupBadgeStyle(color);
};

export const getReminderDueUrgencyLabel = (
  urgency: "overdue" | "soon" | "normal",
): string =>
  urgency === "overdue"
    ? "Overdue"
    : urgency === "soon"
      ? "Due Soon"
      : "Upcoming";

export const getReminderTypeBadgeStyle = (
  reminderType?: string,
):
  | { color: string; backgroundColor: string; borderColor: string }
  | undefined => {
  const t = (reminderType ?? "").toLowerCase();
  if (t === "overdue") return getLookupBadgeStyle(DUE_STATUS_COLORS.overdue);
  if (t === "due_today") return getLookupBadgeStyle(DUE_STATUS_COLORS["due-today"]);
  if (t === "7_days" || t === "14_days" || t === "30_days") {
    return getLookupBadgeStyle("#eab308");
  }
  return getLookupBadgeStyle("#64748b");
};

export const getDueStatus = (
  nextBillingDate?: string,
): { status: DueStatus; label: string; color: string } | null => {
  if (!nextBillingDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextBillingDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0)
    return {
      status: "overdue",
      label: "Overdue",
      color: DUE_STATUS_COLORS.overdue,
    };
  if (diffDays === 0)
    return {
      status: "due-today",
      label: "Due Today",
      color: DUE_STATUS_COLORS["due-today"],
    };
  if (diffDays <= 7)
    return {
      status: "due-soon",
      label: "Due Soon",
      color: DUE_STATUS_COLORS["due-soon"],
    };
  return {
    status: "upcoming",
    label: "Upcoming",
    color: DUE_STATUS_COLORS.upcoming,
  };
};
