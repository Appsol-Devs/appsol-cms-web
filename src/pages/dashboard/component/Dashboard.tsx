import { dashboardSummaryInfo } from "../common/dashboard";
import DashboardChart from "./DashboardChart";
import DashboardGreetings from "./DashboardGreetings";
import DashboardOutstanding from "./DashboardOutstanding";
import DashboardSummaryCard from "./DashboardSummaryCard";

const Dashboard = () => {
  return (
    <div className="space-y-2 w-full">
      <DashboardGreetings />
      <div className="grid grid-cols-4 gap-4">
        {dashboardSummaryInfo.map((summary, idx) => (
          <DashboardSummaryCard key={idx} summary={summary} />
        ))}
      </div>
      <div className="w-full flex min-h-60 gap-5">
        <DashboardChart />
        <DashboardOutstanding />
      </div>
    </div>
  );
};

export default Dashboard;
