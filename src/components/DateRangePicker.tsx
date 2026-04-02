import React, { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, CalendarX } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  subDays,
  subMonths,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  endOfDay,
} from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { DatePicker } from "./DatePicker";
// import { useTranslation } from "react-i18next";

export interface IDateRange {
  start: Date | null;
  end: Date | null;
}

interface IRange {
  dateRange: ({ start, end }: IDateRange) => void;
  defaultDate?: IDateRange;
  placeholder?: string;
  dateOnly?: boolean;
  allowFuture?: boolean;
}

interface IPreset {
  label: string;
  value: string;
  show?: boolean;
}

const DateRangeComponent = ({
  dateRange,
  defaultDate,
  placeholder,
  dateOnly,
  allowFuture,
}: IRange) => {
  //   const { t } = useTranslation();
  const allPresets: IPreset[] = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "last7" },
    { label: "Last 30 Days", value: "last30Days" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Previous 3 Months", value: "last3months" },
    { label: "This Year", value: "thisYear" },
    { label: "Last Year", value: "lastYear" },
    { label: "Next 7 Days", value: "next7", show: true },
    { label: "Next 30 Days", value: "next30", show: true },
    { label: "Next Month", value: "nextMonth", show: true },
    { label: "Next Year", value: "nextYear", show: true },
    { label: "Custom", value: "custom" },
  ];

  const filteredPresets = allPresets.filter(
    ({ show }) => allowFuture || show === undefined,
  );

  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const [isOpen, setIsOpen] = React.useState(false);

  const [preset, setPreset] = React.useState<string | null>(() => {
    if (defaultDate) return "custom";
    return null;
  });
  const [showCalendars, setShowCalendars] = React.useState<boolean | null>(
    null,
  );

  const [selectedDateRange, setSelectedDateRange] = React.useState<IDateRange>({
    start: null,
    end: null,
  });

  useEffect(() => {
    if (defaultDate) {
      setSelectedDateRange(defaultDate);
    }
  }, [defaultDate]);

  useEffect(() => {
    if (preset === "custom") {
      setShowCalendars(true);
    } else {
      setShowCalendars(false);
    }
  }, [preset]);

  const handleDateSubmit = () => {
    if (selectedDateRange.start && selectedDateRange.end) {
      let { start, end } = selectedDateRange;

      if (start > end) {
        [start, end] = [end, start]; // Swap values if start is greater than end
      }
      setSelectedDateRange({ start, end }); // Update state
      setPreset(null);
      dateRange({ start, end }); // Pass corrected range
    }
    setIsOpen(false);
  };

  const handleClearDate = () => {
    setSelectedDateRange({ start: null, end: null });
    dateRange({ start: null, end: null });
    setIsOpen(false);
  };

  const handleDateQuickSelect = (value: string) => {
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (value === "custom") {
      setPreset(value);
      return;
    }

    switch (value) {
      case "today":
        start = midnight;
        end = today;
        break;
      case "yesterday":
        start = subDays(midnight, 1);
        end = endOfDay(subDays(midnight, 1));
        break;
      case "last7":
        start = subDays(midnight, 7);
        end = today;
        break;
      case "last30Days":
        start = subDays(midnight, 30);
        end = today;
        break;
      case "last3months":
        start = startOfMonth(subMonths(today, 3));
        end = endOfMonth(subMonths(today, 1));
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case "thisMonth":
        start = startOfMonth(today);
        end = today;
        break;
      case "thisYear":
        start = startOfYear(midnight);
        end = today;
        break;
      case "lastYear":
        start = startOfYear(subYears(today, 1));
        end = endOfYear(subYears(today, 1));
        break;
      case "next7":
        start = today;
        end = subDays(today, -7);
        break;
      case "next30":
        start = today;
        end = subDays(today, -30);
        break;
      case "nextMonth":
        start = startOfMonth(subMonths(today, -1));
        end = endOfMonth(subMonths(today, -1));
        break;
      case "nextYear":
        start = startOfYear(subYears(today, -1));
        end = endOfYear(subYears(today, -1));
        break;
      default:
        break;
    }

    setSelectedDateRange({ start, end });
    setPreset(value);
    dateRange({ start, end });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-max min-w-0 max-w-[16.5rem] sm:max-w-[22rem] md:max-w-[28rem] justify-start text-left font-normal bg-card! text-onCard! hover:bg-surfaceVariant hover:text-onSurfaceVariant outline-0! ring-0! overflow-hidden",
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {selectedDateRange.start && selectedDateRange.end ? (
            <span className="text-xs truncate">
              <span className="sm:hidden">
                {format(selectedDateRange?.start, dateOnly ? "do MMM y" : "do MMM y")}
              </span>
              <span className="hidden sm:inline">
                {format(
                  selectedDateRange?.start,
                  dateOnly ? "do MMM y" : "do MMM y hh:mm aa",
                )}{" "}
                -{" "}
                {format(
                  selectedDateRange?.end,
                  dateOnly ? "do MMM y" : "do MMM y hh:mm aa",
                )}
              </span>
            </span>
          ) : (
            <span className="text-sm truncate">
              {placeholder || "Choose preferred date range"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(100vw-1rem,54rem)] max-w-[calc(100vw-1rem)] space-y-2 overflow-hidden bg-card p-3 text-onCard sm:w-auto sm:max-w-[min(100vw-2rem,56rem)]"
      >
        <div className="flex max-h-[min(85vh,760px)] flex-col gap-3 overflow-y-auto overflow-x-hidden sm:max-h-[min(90vh,820px)] sm:flex-row sm:items-start sm:overflow-visible">
          <ScrollArea className="h-48 shrink-0 sm:h-72 sm:max-w-[9.5rem]">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                {filteredPresets.map(({ label, value }) => {
                  return (
                    <Button
                      key={value}
                      variant={preset === value ? "default" : "ghost"}
                      className={`px-2 py-1 text-xs! hover:cursor-pointer ring-0! outline-0! hover:opacity-60 ${
                        preset === value
                          ? "bg-primary! text-primary-foreground!"
                          : "bg-card! text-onCard! hover:bg-primary/60! hover:text-primary-foreground!"
                      }`}
                      onClick={() => handleDateQuickSelect(value)}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
          <div className="min-w-0 flex-1 overflow-x-auto">
            {showCalendars ? (
              <div className="flex min-w-0 max-w-full flex-nowrap items-start gap-3 overflow-x-auto pb-0.5">
                <div className="min-w-[17.5rem] shrink-0 rounded-md border border-border/60 bg-card p-2">
                  <DatePicker
                    title="From"
                    dateOnly={dateOnly}
                    defaultDate={selectedDateRange?.start}
                    placeholder="Start Date"
                    onChange={(date) =>
                      setSelectedDateRange((prev) => ({ ...prev, start: date }))
                    }
                    allowFuture={allowFuture}
                    showInPopover={false}
                    calendarClassName="[--cell-size:1.35rem] text-xs"
                  />
                </div>
                <div className="min-w-[17.5rem] shrink-0 rounded-md border border-border/60 bg-card p-2">
                  <DatePicker
                    title="To"
                    dateOnly={dateOnly}
                    defaultDate={selectedDateRange?.end}
                    disabled={!selectedDateRange.start}
                    placeholder="End Date"
                    onChange={(date) =>
                      setSelectedDateRange((prev) => ({ ...prev, end: date }))
                    }
                    allowFuture={allowFuture}
                    showInPopover={false}
                    calendarClassName="[--cell-size:1.35rem] text-xs"
                  />
                </div>
              </div>
            ) : null}
            {showCalendars ? (
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  className="bg-error hidden text-onError"
                  onClick={handleClearDate}
                  disabled={!selectedDateRange.start || !selectedDateRange.end}
                >
                  <CalendarX className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleDateSubmit}
                  className="text-sm! bg-primary! text-onPrimary!"
                  disabled={!selectedDateRange.start || !selectedDateRange.end}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Pick Date
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeComponent;
