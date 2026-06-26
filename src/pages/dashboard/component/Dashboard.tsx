import { useMemo, useState, type ReactNode } from "react";
import DateRangeComponent from "@/components/DateRangePicker";
import {
  buildSummaryCards,
  dashboardRangeToDates,
  datesToDashboardRange,
  getThisMonthRange,
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
  const [summaryDateRange, setSummaryDateRange] = useState<IDashboardDateRange>(
    () => getThisMonthRange(),
  );
  const [chartDateRange, setChartDateRange] = useState<IDashboardDateRange>(
    () => getThisWeekRange(),
  );

  const { data: summary, isError: summaryError } =
    useGetDashboardSummaryQuery(summaryDateRange);
  const {
    data: revenueTrends,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useGetWeeklyRevenueTrendsQuery(toChartDate(chartDateRange));
  const {
    data: operationalInsights,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useGetOperationalInsightsQuery();

  const summaryCards = useMemo(
    () => withCardIcons(buildSummaryCards(summary ?? null)),
    [summary]
  );

  const summaryDefaultDates = useMemo(
    () => dashboardRangeToDates(summaryDateRange),
    [summaryDateRange.startDate, summaryDateRange.endDate],
  );

  return (
    <div className="space-y-2 w-full min-w-0 max-w-full overflow-x-hidden">
      <DashboardGreetings />
      {summaryError ? (
        <p className="text-sm text-destructive">
          Failed to load summary. Please try again.
        </p>
      ) : null}
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 max-w-full flex-col gap-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-foreground">Summary</p>
            <DateRangeComponent
              dateRange={({ start, end }) => {
                const next = datesToDashboardRange(start, end);
                if (next) setSummaryDateRange(next);
              }}
              defaultDate={summaryDefaultDates}
              dateOnly
              allowFuture={false}
              placeholder="Select date range"
            />
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            {summaryCards.map((card) => (
              <DashboardSummaryCard key={card.title} summary={card} />
            ))}
          </div>
          <DashboardChart
            data={revenueTrends ?? null}
            isLoading={revenueLoading}
            isError={revenueError}
            dateRange={chartDateRange}
            onDateRangeChange={setChartDateRange}
          />
        </div>
        <div className="flex min-w-0 max-w-full flex-col gap-5">
          <DashboardReminders />
          <DashboardOperationalInsights
            data={operationalInsights ?? null}
            isLoading={insightsLoading}
            isError={insightsError}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
