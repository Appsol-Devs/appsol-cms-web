import CardComponent from "@/components/CardComponent";
import { ChartAreaInteractive } from "@/components/chart/chart-area-interactive";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileDown } from "lucide-react";
import { useState } from "react";

interface IChartRange {
  label: string;
  value: "180d" | "90d" | "30d" | "7d";
}

const DashboardChart = () => {
  const chartDurations: IChartRange[] = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "3 Months", value: "90d" },
    // { label: "6 Months", value: "180d" },
  ];

  const [activeDuration, setActiveDuration] = useState<IChartRange>(
    chartDurations[0]
  );
  return (
    <CardComponent
      className="w-3/5"
      headerTitle={
        <div className="flex items-center justify-between p-0.5">
          <p className="text-sm font-bold">Financial Review</p>
          <div className="flex items-center gap-1">
            {chartDurations.map((duration) => (
              <div
                onClick={() => setActiveDuration(duration)}
                className={cn(
                  "text-xs! hover:bg-primary hover:text-onPrimary px-2 py-1 hover:opacity-80 rounded-sm cursor-pointer",
                  activeDuration.value === duration.value &&
                    "bg-primary text-onPrimary"
                )}
                key={duration.value}
              >
                {duration.label}
              </div>
            ))}
          </div>
          <Button className="text-xs! bg-primary! text-onPrimary! h-6!">
            <FileDown /> Export PDF
          </Button>
        </div>
      }
    >
      <ChartAreaInteractive range={activeDuration.value} />
    </CardComponent>
  );
};

export default DashboardChart;
