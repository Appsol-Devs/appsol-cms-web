import { useMemo, useState, type ReactNode } from "react";
import {
  buildSummaryCards,
  getThisWeekRange,
  SUMMARY_CARD_ICON_CLASSES,
  toChartDate,
  type IDashboardDateRange,
  type IDashboardSummaryCardProps,
} from "../common/dashboard";
import {
  useGetDashboardSummaryQuery,
  useGetOperationalInsightsQuery,
  useGetWeeklyRevenueTrendsQuery,
} from "../common/dashboardApi";
import DashboardChart from "./DashboardChart";
import DashboardGreetings from "./DashboardGreetings";
import DashboardOperationalInsights from "./DashboardOperationalInsights";
import DashboardReminders from "./DashboardReminders";
import DashboardSummaryCard from "./DashboardSummaryCard";

const summaryCardIcon = (className: string) => (
  <span className={`${className} size-4 shrink-0 inline-block`} aria-hidden />
);

const CARD_ICONS: Record<string, ReactNode> = Object.fromEntries(
  Object.entries(SUMMARY_CARD_ICON_CLASSES).map(([title, cls]) => [
    title,
    summaryCardIcon(cls),
  ])
);

function withCardIcons(cards: IDashboardSummaryCardProps[]): IDashboardSummaryCardProps[] {
  return cards.map((card) => ({ ...card, icon: CARD_ICONS[card.title] ?? card.icon }));
}

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<IDashboardDateRange>(() => getThisWeekRange());

  const { data: summary, isError: summaryError } = useGetDashboardSummaryQuery(dateRange);
  const {
    data: revenueTrends,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useGetWeeklyRevenueTrendsQuery(toChartDate(dateRange));
  const {
    data: operationalInsights,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useGetOperationalInsightsQuery();

  const summaryCards = useMemo(
    () => withCardIcons(buildSummaryCards(summary ?? null)),
    [summary]
  );

  return (
    <div className="space-y-2 w-full">
      <DashboardGreetings />
      {summaryError ? (
        <p className="text-sm text-destructive">
          Failed to load summary. Please try again.
        </p>
      ) : null}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <DashboardSummaryCard key={card.title} summary={card} />
        ))}
      </div>
      <div className="grid w-full min-h-60 grid-cols-1 md:grid-cols-[1fr_1fr] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <DashboardChart
            data={revenueTrends ?? null}
            isLoading={revenueLoading}
            isError={revenueError}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <DashboardReminders />
        </div>
        <DashboardOperationalInsights
          data={operationalInsights ?? null}
          isLoading={insightsLoading}
          isError={insightsError}
        />
      </div>
    </div>
  );
};

export default Dashboard;
