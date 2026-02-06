import CardComponent from "@/components/CardComponent";
import type { IOperationalInsights } from "../common/dashboard";

const CARD_CLASS = "w-2/5";
const HEADER_TITLE = <p className="font-bold">Operational Insights</p>;

interface DashboardOperationalInsightsProps {
  data: IOperationalInsights | null;
  isLoading?: boolean;
  isError?: boolean;
}

const InsightRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className="capitalize text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const DashboardOperationalInsights = ({
  data,
  isLoading,
  isError,
}: DashboardOperationalInsightsProps) => {
  const loadingOrError = isLoading || isError || !data;
  const message = isLoading
    ? "Loading..."
    : isError
      ? "Failed to load insights."
      : !data
        ? "No data available"
        : null;

  if (loadingOrError) {
    return (
      <CardComponent className={CARD_CLASS} headerTitle={HEADER_TITLE}>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          {message}
        </div>
      </CardComponent>
    );
  }

  const { complaints, tickets } = data;

  return (
    <CardComponent
      className={CARD_CLASS}
      headerTitle={HEADER_TITLE}
      headerDescription={
        <p className="text-xs mb-2">Complaints and tickets by status</p>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-red-500 font-semibold uppercase mb-2">
            Complaints
          </p>
          <div className="space-y-0">
            <InsightRow label="Open" value={complaints.open} />
            <InsightRow label="In progress" value={complaints["in-progress"]} />
            <InsightRow label="Rescheduled" value={complaints.rescheduled} />
            <InsightRow label="Resolved" value={complaints.resolved} />
            <InsightRow label="Closed" value={complaints.closed} />
          </div>
        </div>
        <div>
          <p className="text-xs text-green-500 font-semibold uppercase mb-2">
            Tickets
          </p>
          <div className="space-y-0">
            <InsightRow label="Open" value={tickets.open} />
            <InsightRow label="Fixed" value={tickets.fixed} />
            <InsightRow label="Closed" value={tickets.closed} />
            <InsightRow label="Assigned" value={tickets.assigned} />
            <InsightRow label="Rejected" value={tickets.rejected} />
          </div>
        </div>
      </div>
    </CardComponent>
  );
};

export default DashboardOperationalInsights;
