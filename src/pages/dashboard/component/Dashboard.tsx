import { useMemo, useState } from "react";
import {
  getThisWeekRange,
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
import DashboardSummaryCard from "./DashboardSummaryCard";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<IDashboardDateRange>(
    () => getThisWeekRange()
  );

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetDashboardSummaryQuery(dateRange);
  const {
    data: revenueTrends,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useGetWeeklyRevenueTrendsQuery(dateRange);
  const {
    data: operationalInsights,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useGetOperationalInsightsQuery();

  const summaryCards: IDashboardSummaryCardProps[] = useMemo(() => {
    if (!summary) return [];
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
  }, [summary]);

  return (
    <div className="space-y-2 w-full">
      <DashboardGreetings />
      <div className="grid grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))
        ) : summaryError ? (
          <p className="col-span-4 text-sm text-destructive">
            Failed to load summary. Please try again.
          </p>
        ) : (
          summaryCards.map((card) => (
            <DashboardSummaryCard key={card.title} summary={card} />
          ))
        )}
      </div>
      <div className="flex w-full min-h-60 gap-5">
        <DashboardChart
          data={revenueTrends ?? null}
          isLoading={revenueLoading}
          isError={revenueError}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
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
