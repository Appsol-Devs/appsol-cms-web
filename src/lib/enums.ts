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
