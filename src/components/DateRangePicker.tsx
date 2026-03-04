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
            "w-max justify-start text-left font-normal bg-card! text-onCard! hover:bg-surfaceVariant hover:text-onSurfaceVariant outline-0! ring-0!",
          )}
        >
          <CalendarIcon className="h-4 w-2" />
          {selectedDateRange.start && selectedDateRange.end ? (
            <span className="text-xs">
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
          ) : (
            <span className="text-sm">
              {placeholder || "Choose preferred date range"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-auto space-y-2 bg-card text-onCard">
        <div className="flex items-start justify-start">
          <ScrollArea className="h-72">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                {filteredPresets.map(({ label, value }) => {
                  return (
                    <Button
                      key={value}
                      variant={preset === value ? "default" : "ghost"}
                      className={`px-2 py-1 text-xs! hover:cursor-pointer ring-0! outline-0! hover:opacity-60 ${
                        preset === value
                          ? "bg-surfaceVariant! text-onSurfaceVariant!"
                          : "bg-card! text-onCard!"
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
          <div>
            {showCalendars ? (
              <div className="flex items-center space-x-2 w-max">
                <DatePicker
                  title="From"
                  dateOnly={dateOnly}
                  defaultDate={selectedDateRange?.start}
                  placeholder="Start Date"
                  onChange={(date) =>
                    setSelectedDateRange({ ...selectedDateRange, start: date })
                  }
                  allowFuture={allowFuture}
                />
                <DatePicker
                  title="To"
                  dateOnly={dateOnly}
                  defaultDate={selectedDateRange?.end}
                  disabled={!selectedDateRange.start}
                  placeholder="End Date"
                  onChange={(date) =>
                    setSelectedDateRange({ ...selectedDateRange, end: date })
                  }
                  allowFuture={allowFuture}
                />
              </div>
            ) : null}
            {showCalendars ? (
              <div className="flex items-center justify-between w-full">
                <Button
                  className="bg-error hidden text-onError"
                  onClick={handleClearDate}
                  disabled={!selectedDateRange.start || !selectedDateRange.end}
                >
                  <CalendarX className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <p></p>
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
