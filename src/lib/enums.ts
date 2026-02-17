export enum COMPLAINT_STATUS_ENUM {
  Open = "open",
  "In Progress" = "in-progress",
  Resolved = "resolved",
  Closed = "closed",
  Rescheduled = "rescheduled",
}

export enum LEAD_PRIORITY_ENUM {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum LEAD_STATUS_ENUM {
  NEW = "new",
  EVALUATING = "evaluating",
  BUILDING_PROPOSAL = "buildingProposal",
  QUALIFIED = "qualified",
  NEGOTIATION = "negotiation",
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "#3B82F6",
  evaluating: "#EAB308",
  buildingproposal: "#A855F7",
  qualified: "#0E9F6E",
  negotiation: "#EF4444",
  closed: "#D4A574",
  won: "#14B8A6",
};

export const getLeadStatusColor = (status?: string) =>
  status ? LEAD_STATUS_COLORS[status.toLowerCase()] ?? undefined : undefined;
