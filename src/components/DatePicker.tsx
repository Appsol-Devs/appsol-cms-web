import * as React from "react";
import { format } from "date-fns";
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
}: Props) {
  const [date, setDate] = React.useState<Date | undefined>(
    defaultDate ? defaultDate : undefined
  );
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      } else if (type === "ampm") {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === "PM" ? currentHours + 12 : currentHours - 12
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
            from: toDateOnly(rangeStart) <= toDateOnly(rangeEnd) ? toDateOnly(rangeStart) : toDateOnly(rangeEnd),
            to: toDateOnly(rangeStart) <= toDateOnly(rangeEnd) ? toDateOnly(rangeEnd) : toDateOnly(rangeStart),
          },
        }
      : undefined;

  const innerContent = (
    <div className="sm:flex">
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
            <div className="flex sm:flex-col p-2 gap-0.5">
              {hours
                .slice()
                .reverse()
                .map((hour) => {
                  const isActive = date && date.getHours() % 12 === hour % 12;

                  return (
                    <Button
                      key={hour}
                      size="icon"
                      className={cn(
                        "sm:w-full shrink-0 aspect-square",
                        !isActive && "bg-rx-neutral text-rx-neutral-foreground"
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
            <div className="flex sm:flex-col p-2 gap-0.5">
              {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                const isActive = date && date.getMinutes() === minute;
                return (
                  <Button
                    key={minute}
                    size="icon"
                    className={cn(
                      "sm:w-full shrink-0 aspect-square",
                      !isActive && "bg-rx-neutral text-rx-neutral-foreground"
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
            <div className="flex sm:flex-col p-2 gap-0.5">
              {["AM", "PM"].map((ampm) => {
                const isActive =
                  date &&
                  ((ampm === "AM" && date.getHours() < 12) ||
                    (ampm === "PM" && date.getHours() >= 12));

                return (
                  <Button
                    key={ampm}
                    size="icon"
                    className={cn(
                      "sm:w-full shrink-0 aspect-square",
                      !isActive && "bg-rx-neutral text-rx-neutral-foreground"
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
    <div>
      {showInPopover && title ? (
        <div className="text-xs flex items-center space-x-1">
          <p className="mr-1">{title}</p>
          {required ? <span className="text-destructive">*</span> : ""}
        </div>
      ) : null}
      {title && !showInPopover ? (
        <div className="font-bold text-sm bg-gray-300 flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <div className="text-xs flex items-center space-x-1">
            <p className="mr-1">{title}</p>
            {required ? <span className="text-destructive">*</span> : ""}
          </div>
          {date && format(date, dateOnly ? "do MMM y" : "do MMM y hh:mm aa")}
        </div>
      ) : null}
      <div>
        {showInPopover ? (
          <Popover>
            <PopoverTrigger asChild>
              <div
                // variant="outline"
                className="w-full flex text-xs border-2 justify-start text-left p-1 rounded-sm bg-accent font-normal "
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, dateOnly ? "do MMM y" : "do MMM y hh:mm aa")
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              {innerContent}
            </PopoverContent>
          </Popover>
        ) : (
          innerContent
        )}

        {/* {dateOnly ? null : (
          <div className="flex flex-col sm:flex-row sm:h-max divide-y sm:divide-y-0 sm:divide-x">
            <div>
              <Label htmlFor="hour">Hr</Label>
              <Input
                id="hour"
                type={"number"}
                key={"hour"}
                className="w-20"
                // value={hour}
                onChange={(e: any) =>
                  handleTimeChange("hour", e.traget.value.toString())
                }
              />
            </div>
            <div>
              <Label htmlFor="minutes">Min</Label>
              <Input
                id="minutes"
                type={"number"}
                className="w-20"
                key={"minutes"}
                // value={hour}
                onChange={(e: any) =>
                  handleTimeChange("minute", e.traget.value.toString())
                }
              />
            </div>
            <ScrollArea>
              <div className="flex sm:flex-col p-2 gap-0.5">
                {["AM", "PM"].map((ampm) => {
                  const isActive =
                    date &&
                    ((ampm === "AM" && date.getHours() < 12) ||
                      (ampm === "PM" && date.getHours() >= 12));

                  return (
                    <Button
                      key={ampm}
                      size="icon"
                      className={cn(
                        "sm:w-full shrink-0 aspect-square",
                        !isActive && "bg-rx-neutral text-rx-neutral-foreground"
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
        )} */}
      </div>
    </div>
  );
}
