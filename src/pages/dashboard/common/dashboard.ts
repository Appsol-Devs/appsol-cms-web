import { format, startOfDay, subDays } from "date-fns";
import type { SVGProps } from "react";

export interface IDashboardDateRange {
  startDate: string;
  endDate: string;
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
  icon?: React.FC<SVGProps<SVGSVGElement>>;
  value: number;
  isCurrency?: boolean;
  valueSuffix?: string;
  growthPercent?: number;
}

export const DEFAULT_DASHBOARD_DAYS = 7;

/** "This week": 7 days ending today (current date). */
export const getThisWeekRange = (): IDashboardDateRange => {
  const end = startOfDay(new Date());
  const start = subDays(end, DEFAULT_DASHBOARD_DAYS - 1);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};

/** "Last week": 7 days ending 7 days ago. */
export const getLastWeekRange = (): IDashboardDateRange => {
  const end = subDays(startOfDay(new Date()), 7);
  const start = subDays(end, DEFAULT_DASHBOARD_DAYS - 1);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};
