import CardComponent from "@/components/CardComponent";
import type { IOperationalInsights } from "../common/dashboard";
import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend);

const CARD_CLASS = "w-2/5";
const HEADER_TITLE = <p className="font-bold">Operational Insights</p>;

const COMPLAINTS_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#6b7280"];

const TICKETS_COLORS = ["#3b82f6", "#22c55e", "#6b7280", "#8b5cf6", "#ef4444"];

interface DashboardOperationalInsightsProps {
  data: IOperationalInsights | null;
  isLoading?: boolean;
  isError?: boolean;
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        pointStyle: "circle" as const,
        boxWidth: 6,
        boxHeight: 6,
        padding: 12,
      },
    },
  },
};

function buildComplaintsChartData(data: IOperationalInsights["complaints"]) {
  const labels = ["Open", "In progress", "Rescheduled", "Resolved", "Closed"];
  const values = [
    data.open,
    data["in-progress"],
    data.rescheduled,
    data.resolved,
    data.closed,
  ];
  return { labels, values };
}

function buildTicketsChartData(data: IOperationalInsights["tickets"]) {
  const labels = ["Open", "Fixed", "Closed", "Assigned", "Rejected"];
  const values = [data.open, data.fixed, data.closed, data.assigned, data.rejected];
  return { labels, values };
}

const DashboardOperationalInsights = ({
  data,
  isLoading,
  isError,
}: DashboardOperationalInsightsProps) => {
  if (isLoading || isError || !data) {
    const message = isLoading ? "Loading chart..." : isError ? "Failed to load insights." : "No data available";
    return (
      <CardComponent className={CARD_CLASS} headerTitle={HEADER_TITLE}>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          {message}
        </div>
      </CardComponent>
    );
  }

  const complaints = buildComplaintsChartData(data.complaints);
  const tickets = buildTicketsChartData(data.tickets);
  const complaintsChartData = {
    labels: complaints.labels,
    datasets: [{ data: complaints.values, backgroundColor: COMPLAINTS_COLORS, borderWidth: 1 }],
  };
  const ticketsChartData = {
    labels: tickets.labels,
    datasets: [{ data: tickets.values, backgroundColor: TICKETS_COLORS, borderWidth: 1 }],
  };

  return (
    <CardComponent
      className={CARD_CLASS}
      headerTitle={HEADER_TITLE}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs text-red-500 font-semibold uppercase mb-2">
            Complaints
          </p>
          <div className="h-48 w-full">
            <Doughnut data={complaintsChartData} options={doughnutOptions} />
          </div>
        </div>
        <div>
          <p className="text-xs text-green-500 font-semibold uppercase mb-2">
            Tickets
          </p>
          <div className="h-48 w-full">
            <Doughnut data={ticketsChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </CardComponent>
  );
};

export default DashboardOperationalInsights;
