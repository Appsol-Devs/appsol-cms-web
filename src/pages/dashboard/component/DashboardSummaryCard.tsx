import CardComponent from "@/components/CardComponent";
import { formatToCurrency } from "@/lib/helpers";
import type { IDashboardSummaryCardProps } from "../common/dashboard";

const DashboardSummaryCard = ({
  summary: {
    title,
    value,
    isCurrency = false,
    valueSuffix,
  },
}: {
  summary: IDashboardSummaryCardProps;
}) => {
  const displayValue = valueSuffix
    ? `${value}${valueSuffix}`
    : isCurrency
      ? formatToCurrency(value)
      : value;

  return (
    <CardComponent
      className="relative max-h-24"
      headerTitle={<p className="text-xs uppercase font-semibold">{title}</p>}
    >
      <div>
        <p className="font-bold text-lg">{displayValue}</p>
      </div>
    </CardComponent>
  );
};

export default DashboardSummaryCard;
