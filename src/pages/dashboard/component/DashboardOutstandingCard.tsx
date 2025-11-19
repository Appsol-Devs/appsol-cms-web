import { formatToCurrency } from "@/lib/helpers";
import type { IDashboardOutshandingProps } from "../common/dashboard";

const DashboardOutstandingCard = ({
  outstanding,
}: {
  outstanding: IDashboardOutshandingProps;
}) => {
  return (
    <div className="flex py-1 items-center justify-between border-b-2">
      <div className="text-xs">
        <p className="font-semibold text-sm">{outstanding.invoiceId}</p>
        <p>{new Date(outstanding.dueDate).toDateString()}</p>
        <p className="italic font-semibold ">{outstanding.name}</p>
      </div>
      <p className="font-semibold text-sm">
        {formatToCurrency(outstanding.amount ?? 0)}
      </p>
    </div>
  );
};

export default DashboardOutstandingCard;
