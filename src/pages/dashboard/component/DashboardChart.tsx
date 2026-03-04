import CardComponent from "@/components/CardComponent";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CategoryScale,
  Chart as ChartJS,
  type Chart,
  type ChartData,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { format, parseISO } from "date-fns";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  getPresetFromRange,
  rangeFromDate,
  REVENUE_RANGE_PRESETS,
  type IDashboardDateRange,
  type IWeeklyRevenueTrends,
  type RangePreset,
} from "../common/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const BUTTON_CLASS =
  "text-xs! px-2 py-1 rounded-sm cursor-pointer border-0 shadow-none outline-none hover:!bg-primary hover:!text-onPrimary hover:opacity-80";

const CHART_HEIGHT = 300;

function formatYAxisTick(v: number | string): string {
  if (typeof v !== "number") return String(v);
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return String(v);
}

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      align: "start" as const,
      labels: {
        usePointStyle: true,
        pointStyle: "rect" as const,
        boxWidth: 14,
        boxHeight: 14,
        generateLabels: (chart: Chart<"line", number[], string>) => {
          const dataset = chart.data.datasets[0];
          const gradient = getLegendGradientFill(chart.ctx);
          return [
            {
              text: dataset.label ?? "Revenue",
              fillStyle: gradient,
              strokeStyle: "#22c55e",
              lineWidth: 1,
              pointStyle: "rect" as const,
              fontColor: "#171717",
              hidden: false,
              index: 0,
              datasetIndex: 0,
            },
          ];
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number | null } }) =>
          ctx.parsed.y != null
            ? `Revenue: ${ctx.parsed.y.toLocaleString()}`
            : "",
      },
    },
  },
  scales: {
    x: {
      title: { display: false },
      grid: { display: false },
      ticks: { maxRotation: 0 },
    },
    y: {
      title: { display: false },
      beginAtZero: true,
      grid: { display: false },
      ticks: {
        callback: (v: number | string) => formatYAxisTick(v),
      },
    },
  },
} as const;

const CHART_DATASET = {
  label: "Revenue",
  fill: true,
  borderColor: "#22c55e",
  tension: 0.3,
  borderWidth: 1,
  pointRadius: 4,
  pointStyle: "circle" as const,
  pointBackgroundColor: "transparent",
  pointBorderColor: "#22c55e",
  pointBorderWidth: 1,
} as const;

const GRADIENT_COLOR_STOPS = [
  [0, "rgba(34, 197, 94, 0.55)"],
  [0.5, "rgba(34, 197, 94, 0.28)"],
  [1, "rgba(34, 197, 94, 0.08)"],
] as const;

function getGradientFill(
  ctx: CanvasRenderingContext2D,
  chartArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null,
): string | CanvasGradient {
  if (!chartArea) return "rgba(34, 197, 94, 0.2)";
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.top,
    0,
    chartArea.bottom,
  );
  GRADIENT_COLOR_STOPS.forEach(([pos, color]) =>
    gradient.addColorStop(pos, color),
  );
  return gradient;
}

function getLegendGradientFill(ctx: CanvasRenderingContext2D): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, 48);
  GRADIENT_COLOR_STOPS.forEach(([pos, color]) =>
    gradient.addColorStop(pos, color),
  );
  return gradient;
}

function buildLineDataset(data: number[]) {
  return {
    label: CHART_DATASET.label,
    data,
    fill: CHART_DATASET.fill,
    borderColor: CHART_DATASET.borderColor,
    backgroundColor: (ctx: {
      chart: {
        ctx: CanvasRenderingContext2D;
        chartArea: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        } | null;
      };
    }) => getGradientFill(ctx.chart.ctx, ctx.chart.chartArea ?? null),
    tension: CHART_DATASET.tension,
    borderWidth: CHART_DATASET.borderWidth,
    pointRadius: CHART_DATASET.pointRadius,
    pointStyle: CHART_DATASET.pointStyle,
    pointBackgroundColor: CHART_DATASET.pointBackgroundColor,
    pointBorderColor: CHART_DATASET.pointBorderColor,
    pointBorderWidth: CHART_DATASET.pointBorderWidth,
  };
}

interface DashboardChartProps {
  data: IWeeklyRevenueTrends | null;
  isLoading?: boolean;
  isError?: boolean;
  dateRange: IDashboardDateRange;
  onDateRangeChange: (range: IDashboardDateRange) => void;
}

export default function DashboardChart({
  data,
  isLoading,
  isError,
  dateRange,
  onDateRangeChange,
}: DashboardChartProps) {
  const [activePreset, setActivePreset] = useState<RangePreset>(() =>
    getPresetFromRange(dateRange),
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(() =>
    dateRange.startDate ? new Date(dateRange.startDate) : null,
  );

  useEffect(() => {
    setActivePreset(getPresetFromRange(dateRange));
    setCustomDate(dateRange.startDate ? new Date(dateRange.startDate) : null);
  }, [dateRange.startDate, dateRange.endDate]);

  const handlePreset = (preset: RangePreset) => {
    const d = REVENUE_RANGE_PRESETS.find((x) => x.id === preset);
    if (!d) return;
    if (d.id === "custom") {
      setCustomDate(dateRange.startDate ? new Date(dateRange.startDate) : null);
      setCustomOpen(true);
      return;
    }
    if (d.getRange) {
      setActivePreset(preset);
      onDateRangeChange(d.getRange());
    }
  };

  const handleCustomApply = () => {
    if (!customDate) return;
    setActivePreset("custom");
    onDateRangeChange(rangeFromDate(format(customDate, "yyyy-MM-dd")));
    setCustomOpen(false);
  };

  const chartData = useMemo((): ChartData<"line", number[], string> => {
    if (!data?.dates?.length) {
      return { labels: [], datasets: [buildLineDataset([])] };
    }
    try {
      const labels = data.dates.map((dateStr) => {
        const parsed = parseISO(dateStr);
        return Number.isNaN(parsed.getTime())
          ? dateStr
          : format(parsed, "yyyy-MM-dd");
      });
      const revenues = data.revenues ?? [];
      const dataValues = labels.map((_, i) => {
        const v = revenues[i];
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? n : 0;
      });
      return { labels, datasets: [buildLineDataset(dataValues)] };
    } catch {
      return { labels: [], datasets: [buildLineDataset([])] };
    }
  }, [data]);

  const renderButton = (d: (typeof REVENUE_RANGE_PRESETS)[0]) => (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        BUTTON_CLASS,
        activePreset !== d.id && "bg-transparent! text-black!",
        activePreset === d.id && "bg-primary! text-onPrimary!",
      )}
      onClick={() => handlePreset(d.id)}
    >
      {d.label}
    </Button>
  );

  return (
    <CardComponent
      className="w-3/5"
      headerTitle={
        <div className="flex w-full items-center justify-between gap-2 p-0.5 bg-white dark:bg-white">
          <p className="text-sm font-bold">Weekly Revenue Trends</p>
          <div className="flex items-center gap-2">
            {REVENUE_RANGE_PRESETS.map((d) =>
              d.id === "custom" ? (
                <Popover
                  key={d.id}
                  open={customOpen}
                  onOpenChange={setCustomOpen}
                >
                  <PopoverTrigger asChild>{renderButton(d)}</PopoverTrigger>
                  <PopoverContent
                    className="w-auto max-h-[85vh] overflow-auto p-2"
                    align="end"
                  >
                    <div className="flex flex-col gap-2">
                      <DatePicker
                        key={`date-${dateRange.startDate}`}
                        title="Date"
                        placeholder="Pick a date"
                        defaultDate={customDate}
                        onChange={setCustomDate}
                        dateOnly
                        allowFuture={false}
                        showInPopover={false}
                        calendarClassName="[--cell-size:1.5rem] text-xs"
                      />
                      <Button
                        size="sm"
                        className="bg-primary! hover:bg-primary/80! w-full"
                        onClick={handleCustomApply}
                        disabled={!customDate}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Fragment key={d.id}>{renderButton(d)}</Fragment>
              ),
            )}
          </div>
        </div>
      }
    >
      <div className="w-full" style={{ minHeight: CHART_HEIGHT }}>
        {isLoading ? (
          <div
            className="flex items-center justify-center text-muted-foreground text-sm"
            style={{ height: CHART_HEIGHT }}
          >
            Loading chart...
          </div>
        ) : isError ? (
          <div
            className="flex items-center justify-center text-destructive text-sm"
            style={{ height: CHART_HEIGHT }}
          >
            Failed to load revenue trends.
          </div>
        ) : (
          <Line data={chartData} options={CHART_OPTIONS} />
        )}
      </div>
    </CardComponent>
  );
}
