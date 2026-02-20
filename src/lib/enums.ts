export enum COMPLAINT_STATUS_ENUM {
  Open = "open",
  "In Progress" = "in-progress",
  Resolved = "resolved",
  Closed = "closed",
  Rescheduled = "rescheduled",
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
    ? COMPLAINT_STATUS_COLORS[status.toLowerCase()] ?? undefined
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
    ? LEAD_PRIORITY_COLORS[priority.toLowerCase()] ?? undefined
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
  status ? LEAD_STATUS_COLORS[status.toLowerCase()] ?? undefined : undefined;

export const getLookupBadgeStyle = (
  colorCode?: string
): { color: string; backgroundColor: string; borderColor: string } | undefined =>
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
  CANCELLED = "cancelled",}
