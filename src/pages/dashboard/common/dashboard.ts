import type { ReactNode } from "react";
import { format, startOfDay, startOfMonth, subDays } from "date-fns";

export interface IDashboardDateRange {
  startDate: string;
  endDate: string;
}

export interface IChartDate {
  startDate: string;
}

export interface IDashboardSummary {
  openIssuesCount: number;
  revenue: number;
  activeSubscriptions: number;
  leadGrowthPercentage: number;
}

export interface IWeeklyRevenueTrends {
  dates: string[];
  revenues: number[];
}

export interface IOperationalInsights {
  complaints: {
    open: number;
    "in-progress": number;
    rescheduled: number;
    resolved: number;
    closed: number;
  };
  tickets: {
    open: number;
    fixed: number;
    closed: number;
    assigned: number;
    rejected: number;
  };
}

export interface IDashboardSummaryCardProps {
  title: string;
  icon?: ReactNode;
  value: number;
  isCurrency?: boolean;
  valueSuffix?: string;
}

export type RangePreset = "this-week" | "last-week" | "custom";

export const SUMMARY_CARD_ICON_CLASSES: Record<string, string> = {
  "Open Issues": "icon-[solar--danger-circle-outline]",
  Revenue: "icon-[solar--banknote-2-outline]",
  "Active Subscriptions": "icon-[solar--users-group-rounded-outline]",
  "Lead Growth": "icon-[solar--course-up-outline]",
};

export const DEFAULT_SUMMARY_CARDS: IDashboardSummaryCardProps[] = [
  { title: "Open Issues", value: 0 },
  { title: "Revenue", value: 0, isCurrency: true },
  { title: "Active Subscriptions", value: 0 },
  { title: "Lead Growth", value: 0, valueSuffix: "%" },
];

export const DEFAULT_DASHBOARD_DAYS = 7;

export const getThisMonthRange = (): IDashboardDateRange => {
  const end = startOfDay(new Date());
  const start = startOfMonth(end);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};

export const getThisWeekRange = (): IDashboardDateRange => {
  const end = startOfDay(new Date());
  const start = subDays(end, DEFAULT_DASHBOARD_DAYS - 1);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};

export const getLastWeekRange = (): IDashboardDateRange => {
  const end = subDays(startOfDay(new Date()), 7);
  const start = subDays(end, DEFAULT_DASHBOARD_DAYS - 1);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};

export const REVENUE_RANGE_PRESETS: Array<{
  id: RangePreset;
  label: string;
  getRange: (() => IDashboardDateRange) | null;
}> = [
  { id: "this-week", label: "This week", getRange: getThisWeekRange },
  { id: "last-week", label: "Last week", getRange: getLastWeekRange },
  { id: "custom", label: "Custom", getRange: null },
];

export function getPresetFromRange(range: IDashboardDateRange): RangePreset {
  const thisWeek = getThisWeekRange();
  const lastWeek = getLastWeekRange();
  if (range.startDate === thisWeek.startDate && range.endDate === thisWeek.endDate)
    return "this-week";
  if (range.startDate === lastWeek.startDate && range.endDate === lastWeek.endDate)
    return "last-week";
  return "custom";
}

export function rangeFromDate(date: string): IDashboardDateRange {
  return { startDate: date, endDate: date };
}

export function toChartDate(range: IDashboardDateRange): IChartDate {
  const dateOnly = (s: string) => s.split("T")[0] ?? s;
  const anchor =
    range.startDate === range.endDate ? range.startDate : range.endDate;
  return { startDate: dateOnly(anchor) };
}

export function dashboardRangeToDates(range: IDashboardDateRange) {
  return {
    start: new Date(`${range.startDate}T00:00:00`),
    end: new Date(`${range.endDate}T00:00:00`),
  };
}

export function datesToDashboardRange(
  start: Date | null,
  end: Date | null,
): IDashboardDateRange | null {
  if (!start || !end) return null;
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
}

export function buildSummaryCards(
  summary: IDashboardSummary | null
): IDashboardSummaryCardProps[] {
  if (!summary) return DEFAULT_SUMMARY_CARDS;
  return [
    { title: "Open Issues", value: summary.openIssuesCount },
    { title: "Revenue", value: summary.revenue, isCurrency: true },
    { title: "Active Subscriptions", value: summary.activeSubscriptions },
    {
      title: "Lead Growth",
      value: summary.leadGrowthPercentage,
      valueSuffix: "%",
    },
  ];
}

export const DASHBOARD_PRESET_BUTTON_CLASS =
  "text-xs! px-2 py-1 rounded-sm cursor-pointer border-0 shadow-none outline-none hover:!bg-primary/60 hover:!text-onPrimary hover:opacity-80";
