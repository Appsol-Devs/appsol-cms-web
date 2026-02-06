import CardComponent from "@/components/CardComponent";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatToCurrency } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  getLastWeekRange,
  getThisWeekRange,
  type IDashboardDateRange,
  type IWeeklyRevenueTrends,
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
  Filler
);

type RangePreset = "this-week" | "last-week" | "custom";

const DURATION: Array<{
  id: RangePreset;
  label: string;
  getRange: (() => IDashboardDateRange) | null;
}> = [
  { id: "this-week", label: "This week", getRange: getThisWeekRange },
  { id: "last-week", label: "Last week", getRange: getLastWeekRange },
  { id: "custom", label: "Custom", getRange: null },
];

const BUTTON_CLASS =
  "text-xs! px-2 py-1 rounded-sm cursor-pointer border-0 shadow-none outline-none hover:!bg-primary hover:!text-onPrimary hover:opacity-80";

function getPresetFromRange(range: IDashboardDateRange): RangePreset {
  const thisWeek = getThisWeekRange();
  const lastWeek = getLastWeekRange();
  if (range.startDate === thisWeek.startDate && range.endDate === thisWeek.endDate)
    return "this-week";
  if (range.startDate === lastWeek.startDate && range.endDate === lastWeek.endDate)
    return "last-week";
  return "custom";
}

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number | null } }) =>
          ctx.parsed.y != null ? formatToCurrency(ctx.parsed.y) : "",
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: "Date" },
      grid: { display: false },
      ticks: { maxRotation: 0 },
    },
    y: {
      title: { display: true, text: "Revenue" },
      beginAtZero: true,
      grid: { color: "#0000000F" },
      ticks: {
        callback: (v: number | string) =>
          typeof v === "number" ? formatToCurrency(v) : v,
      },
    },
  },
} as const;

const CHART_DATASET = {
  label: "Revenue",
  fill: true,
  borderColor: "#22c55e",
  backgroundColor: "#22c55e1a",
  tension: 0.3,
} as const;

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
    getPresetFromRange(dateRange)
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState<Date | null>(() =>
    dateRange.startDate ? new Date(dateRange.startDate) : null
  );
  const [customEnd, setCustomEnd] = useState<Date | null>(() =>
    dateRange.endDate ? new Date(dateRange.endDate) : null
  );
  const [customRangeError, setCustomRangeError] = useState<string | null>(null);

  useEffect(() => {
    setActivePreset(getPresetFromRange(dateRange));
    setCustomStart(dateRange.startDate ? new Date(dateRange.startDate) : null);
    setCustomEnd(dateRange.endDate ? new Date(dateRange.endDate) : null);
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    setCustomRangeError(null);
  }, [customStart, customEnd]);

  const handlePreset = (preset: RangePreset) => {
    const d = DURATION.find((x) => x.id === preset);
    if (!d) return;
    if (d.id === "custom") {
      setCustomStart(dateRange.startDate ? new Date(dateRange.startDate) : null);
      setCustomEnd(dateRange.endDate ? new Date(dateRange.endDate) : null);
      setCustomRangeError(null);
      setCustomOpen(true);
      return;
    }
    if (d.getRange) {
      setActivePreset(preset);
      onDateRangeChange(d.getRange());
    }
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;
    const [start, end] =
      customStart <= customEnd ? [customStart, customEnd] : [customEnd, customStart];
    const days = differenceInCalendarDays(end, start) + 1;
    if (days != 7) {
      setCustomRangeError("Please select a range of 7 days.");
      return;
    }
    setCustomRangeError(null);
    setActivePreset("custom");
    onDateRangeChange({
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    });
    setCustomOpen(false);
  };

  const chartData = useMemo(() => {
    const empty = {
      labels: [] as string[],
      datasets: [{ ...CHART_DATASET, data: [] as number[] }],
    };
    if (!data?.dates?.length) return empty;
    try {
      const labels = data.dates.map((d) => {
        const parsed = parseISO(d);
        return Number.isNaN(parsed.getTime()) ? d : format(parsed, "MMM d");
      });
      const values = data.revenues ?? [];
      const len = Math.min(labels.length, values.length);
      return {
        labels: labels.slice(0, len),
        datasets: [{ ...CHART_DATASET, data: values.slice(0, len) }],
      };
    } catch {
      return empty;
    }
  }, [data]);

  const renderButton = (d: (typeof DURATION)[0]) => (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        BUTTON_CLASS,
        activePreset !== d.id && "!bg-transparent !text-black",
        activePreset === d.id && "!bg-primary !text-onPrimary"
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
            {DURATION.map((d) =>
              d.id === "custom" ? (
                <Popover key={d.id} open={customOpen} onOpenChange={setCustomOpen}>
                  <PopoverTrigger asChild>{renderButton(d)}</PopoverTrigger>
                  <PopoverContent
                    className="w-auto max-h-[85vh] overflow-auto p-2"
                    align="end"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-start">
                        <DatePicker
                          key={`from-${dateRange.startDate}-${dateRange.endDate}`}
                          title="From"
                          placeholder="Start date"
                          defaultDate={customStart}
                          onChange={setCustomStart}
                          dateOnly
                          allowFuture={false}
                          showInPopover={false}
                          calendarClassName="[--cell-size:1.5rem] text-xs"
                          rangeStart={customStart}
                          rangeEnd={customEnd}
                        />
                        <DatePicker
                          key={`to-${dateRange.startDate}-${dateRange.endDate}`}
                          title="To"
                          placeholder="End date"
                          defaultDate={customEnd}
                          onChange={setCustomEnd}
                          dateOnly
                          allowFuture={false}
                          showInPopover={false}
                          disabled={!customStart}
                          calendarClassName="[--cell-size:1.5rem] text-xs"
                          rangeStart={customStart}
                          rangeEnd={customEnd}
                        />
                      </div>
                      {customRangeError ? (
                        <p className="text-xs text-destructive">{customRangeError}</p>
                      ) : null}
                      <Button
                        size="sm"
                        className="!bg-primary hover:!bg-primary/80 w-full"
                        onClick={handleCustomApply}
                        disabled={!customStart || !customEnd}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Fragment key={d.id}>{renderButton(d)}</Fragment>
              )
            )}
          </div>
        </div>
      }
    >
      <div className="min-h-[300px] w-full">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            Loading chart...
          </div>
        ) : isError ? (
          <div className="flex h-[300px] items-center justify-center text-destructive text-sm">
            Failed to load revenue trends.
          </div>
        ) : (
          <Line data={chartData} options={CHART_OPTIONS} />
        )}
      </div>
    </CardComponent>
  );
}
