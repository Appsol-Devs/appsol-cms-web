import CardComponent from "@/components/CardComponent";
import { formatToCurrency } from "@/lib/helpers";
import { ArrowUp } from "lucide-react";
import type { SVGProps } from "react";

export interface IDashboardSummaryCardProps {
  title: string;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
  value: number;
  isCurrency?: boolean;
}
const DashboardSummaryCard = ({
  summary: { title, value, isCurrency = true },
}: {
  summary: IDashboardSummaryCardProps;
}) => {
  return (
    <>
      <CardComponent
        className="relative max-h-24"
        headerTitle={<p className="text-xs uppercase font-semibold">{title}</p>}
      >
        <div className="">
          <p className="font-bold text-lg">
            {isCurrency ? `${formatToCurrency(value)}` : value}
          </p>
          <p className="absolute right-2 bottom-2 text-xs flex items-center gap-0.5">
            <span>+32%</span>
            <span>
              <ArrowUp className="w-3 h-3 text-red-500" />
            </span>
          </p>
        </div>
      </CardComponent>
    </>
  );
};

export default DashboardSummaryCard;
