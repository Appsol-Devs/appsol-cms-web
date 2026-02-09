import CardComponent from "@/components/CardComponent";
import { formatToCurrency } from "@/lib/helpers";
import type { IDashboardSummaryCardProps } from "../common/dashboard";

const DashboardSummaryCard = ({
  summary: { title, value, isCurrency = false, valueSuffix, icon },
}: {
  summary: IDashboardSummaryCardProps;
}) => {
  const displayValue = valueSuffix
    ? `${value}${valueSuffix}`
    : isCurrency
      ? formatToCurrency(value)
      : String(value);

  return (
    <CardComponent
      className="relative overflow-hidden"
      headerTitle={
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      }
    >
      <div className="flex items-start justify-between gap-2 -mt-1">
        <p className="font-bold text-xl text-foreground">{displayValue}</p>
        <div className="shrink-0 flex items-center justify-center h-8 w-8">
          {icon ? (
            <span className="!size-8 shrink-0 flex items-center justify-center text-muted-foreground [&>*]:!size-8">
              {icon}
            </span>
          ) : null}
        </div>
      </div>
    </CardComponent>
  );
};

export default DashboardSummaryCard;
