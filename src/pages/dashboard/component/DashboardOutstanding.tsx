import CardComponent from "@/components/CardComponent";
import { dashboardOutstanding } from "../common/dashboard";
import DashboardOutstandingCard from "./DashboardOutstandingCard";

const DashboardOutstanding = () => {
  return (
    <CardComponent
      className="w-2/5"
      headerTitle={<p className=" font-bold">Outstanding Invoices</p>}
      headerDescription={
        <p className="text-xs mb-2">View all outstanding invoices</p>
      }
    >
      <div>
        {dashboardOutstanding.map((outstanding, idx) => (
          <DashboardOutstandingCard key={idx} outstanding={outstanding} />
        ))}
      </div>
    </CardComponent>
  );
};

export default DashboardOutstanding;
