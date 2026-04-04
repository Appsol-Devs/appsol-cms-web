import * as React from "react";
import { format } from "date-fns";
import { formatDateTime } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Props {
  placeholder: string;
  required?: boolean;
  defaultDate?: Date | null;
  onChange: (date: Date | null) => void;
  value?: Date | null | undefined;
  disabled?: boolean;
  title?: string;
  name?: string;
  allowFuture?: boolean;
  dateOnly?: boolean;
  showInPopover?: boolean;
  calendarClassName?: string;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
}

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function DatePicker({
  onChange,
  disabled,
  dateOnly,
  required,
  showInPopover = true,
  defaultDate,
  title,
  allowFuture = false,
  placeholder,
  calendarClassName,
  rangeStart,
  rangeEnd,
  value,
}: Props) {
  const externalMs = React.useMemo(() => {
    const src =
      value !== undefined && value !== null ? value : defaultDate;
    if (src == null) return undefined;
    if (!(src instanceof Date)) return undefined;
    const t = src.getTime();
    return Number.isNaN(t) ? undefined : t;
  }, [value, defaultDate]);

  const [date, setDate] = React.useState<Date | undefined>(() =>
    externalMs !== undefined ? new Date(externalMs) : undefined,
  );
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (externalMs === undefined) {
      setDate(undefined);
      return;
    }
    setDate((prev) => {
      if (prev?.getTime() === externalMs) return prev;
      return new Date(externalMs);
    });
  }, [externalMs]);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const next = new Date(selectedDate);
    if (date && !dateOnly) {
      next.setHours(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
      );
    }
    setDate(next);
    if (dateOnly) {
      setPopoverOpen(false);
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string,
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0),
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      } else if (type === "ampm") {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === "PM" ? currentHours + 12 : currentHours - 12,
        );
      }
      setDate(newDate);
    }
  };

  React.useEffect(() => {
    if (date && date instanceof Date) {
      onChange(date);
    } else {
      onChange(null);
    }
  }, [date]);

  const rangeModifiers =
    rangeStart && rangeEnd
      ? {
        in_range: {
          from:
            toDateOnly(rangeStart) <= toDateOnly(rangeEnd)
              ? toDateOnly(rangeStart)
              : toDateOnly(rangeEnd),
          to:
            toDateOnly(rangeStart) <= toDateOnly(rangeEnd)
              ? toDateOnly(rangeEnd)
              : toDateOnly(rangeStart),
        },
      }
      : undefined;

  const innerContent = (
    <div className="min-w-0 sm:flex sm:flex-nowrap">
      <Calendar
        mode="single"
        disabled={disabled}
        selected={date}
        defaultMonth={date ?? defaultDate ?? new Date()}
        onSelect={handleDateSelect}
        toDate={allowFuture ? undefined : new Date()}
        initialFocus
        modifiers={rangeModifiers}
        className={calendarClassName}
      />
      {dateOnly ? null : (
        <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
          <ScrollArea className="w-64 sm:w-auto">
            <div className="flex sm:flex-col p-2 gap-1">
              {hours
                .slice()
                .reverse()
                .map((hour) => {
                  const isActive = date && date.getHours() % 12 === hour % 12;

                  return (
                    <Button
                      key={hour}
                      type="button"
                      size="icon-sm"
                      className={cn(
                        "shrink-0 border border-input text-xs!",
                        isActive
                          ? "bg-primary! text-primary-foreground"
                          : "bg-card! text-card-foreground hover:bg-primary/60! hover:text-primary-foreground!",
                      )}
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  );
                })}
            </div>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>
          <ScrollArea className="w-64 sm:w-auto">
            <div className="flex sm:flex-col p-2 gap-1">
              {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                const isActive = date && date.getMinutes() === minute;
                return (
                  <Button
                    key={minute}
                    type="button"
                    size="icon-sm"
                    className={cn(
                      "shrink-0 border border-input text-xs!",
                      isActive
                        ? "bg-primary! text-primary-foreground"
                        : "bg-card! text-card-foreground hover:bg-primary/60! hover:text-primary-foreground!",
                    )}
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute}
                  </Button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>
          <ScrollArea>
            <div className="flex sm:flex-col p-2 gap-1">
              {["AM", "PM"].map((ampm) => {
                const isActive =
                  date &&
                  ((ampm === "AM" && date.getHours() < 12) ||
                    (ampm === "PM" && date.getHours() >= 12));

                return (
                  <Button
                    key={ampm}
                    type="button"
                    size="icon-sm"
                    className={cn(
                      "shrink-0 border border-input text-xs!",
                      isActive
                        ? "bg-primary! text-primary-foreground"
                        : "bg-card! text-card-foreground hover:bg-primary/60! hover:text-primary-foreground!",
                    )}
                    onClick={() => handleTimeChange("ampm", ampm)}
                  >
                    {ampm}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {showInPopover && title ? (
        <div className="text-xs flex items-center space-x-1 mb-1">
          <p className="mr-1 text-onCard">{title}</p>
          {required ? <span className="text-destructive">*</span> : ""}
        </div>
      ) : null}
      {title && !showInPopover ? (
        <div className="mb-2 flex items-center gap-2 border-b border-border pb-2 text-xs font-medium text-foreground">
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="mr-1">
            {title}
            {required ? <span className="text-destructive">*</span> : null}
          </span>
          {date ? (
            <span className="ml-auto truncate font-normal text-muted-foreground">
              {dateOnly ? format(date, "do MMM y") : formatDateTime(date)}
            </span>
          ) : null}
          <div className="font-bold text-sm bg-gray-300 flex items-center mb-1">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <div className="text-xs flex items-center space-x-1">
              <p className="mr-1 text-onCard">{title}</p>
              {required ? <span className="text-destructive">*</span> : ""}
            </div>
            {date && (dateOnly ? format(date, "do MMM y") : formatDateTime(date))}
          </div>
        </div> 
      ) : null}
      <div className="w-full">
        {showInPopover ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center h-9 px-3 text-xs border border-input rounded-md bg-surface font-normal cursor-pointer transition-colors ",
                  disabled && "opacity-50 cursor-not-allowed",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {date ? (
                    dateOnly ? (
                      format(date, "do MMM y")
                    ) : (
                      formatDateTime(date)
                    )
                  ) : (
                    placeholder
                  )}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              onFocusOutside={(e) => {
                if (!dateOnly) e.preventDefault();
              }}
            >
              {innerContent}
            </PopoverContent>
          </Popover>
        ) : (
          <div className="min-w-0 max-w-full overflow-x-auto pb-0.5">
            {innerContent}
          </div>
        )}
      </div>
    </div>
  );
}