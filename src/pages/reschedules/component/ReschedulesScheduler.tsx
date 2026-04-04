import CardComponent from "@/components/CardComponent";
import LoadingComponent from "@/components/LoadingComponent";
import PageTitle from "@/components/PageTitle";
import SearchComponent from "@/components/SearchComponent";
import ActionButton from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { allRoutes } from "@/utils/routes";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  set,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/components/ui/CustomToast";
import { getTargetEntityTypeColor } from "@/lib/enums";
import { cn } from "@/lib/utils";
import {
  type IReschedule,
  type TargetEntityType,
  getScheduleEnd,
  getScheduleInterval,
  getScheduleStart,
  parseRescheduleDate,
} from "../common/reschedules";
import {
  useLazyGetReschedulesQuery,
  useUpdateRescheduleMutation,
} from "../common/reschedulesApi";
import RescheduleDetailsDrawer from "./RescheduleDetailsDrawer";
import { DASHBOARD_PRESET_BUTTON_CLASS } from "@/pages/dashboard/common/dashboard";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const ENTITY_LEGEND: { type: TargetEntityType; label: string }[] = [
  { type: "Ticket", label: "Ticket" },
  { type: "CustomerComplaint", label: "Customer Complaint" },
  { type: "CustomerOutreach", label: "Customer Outreach" },
  { type: "SubscriptionReminder", label: "Subscription Reminder" },
  { type: "CustomerSetup", label: "Customer Setup" },
  { type: "Generic", label: "Generic" },
];

function calendarColorForEntityType(r: IReschedule): string {
  return getTargetEntityTypeColor(r.targetEntityType) ?? "#64748b";
}

function eventTitle(r: IReschedule): string {
  const t = r.title?.trim();
  if (t) return t;
  if (r.rescheduleCode?.trim()) return r.rescheduleCode.trim();
  return "Schedule";
}

function customerFirstName(r: IReschedule): string | undefined {
  const c = r.customer;
  if (!c || typeof c === "string") return undefined;
  const name = (c as { name?: string }).name?.trim();
  return name || undefined;
}

function scheduleCellTimeAndCustomer(r: IReschedule, cellAt: Date): string {
  const cust = customerFirstName(r);
  const timeStr = format(cellAt, "HH:mm");
  return cust ? `${timeStr} · ${cust}` : timeStr;
}

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

type ScheduleCalendarCell = {
  reschedule: IReschedule;
  at: Date;
};

function expandRescheduleToCalendarCells(
  r: IReschedule,
): ScheduleCalendarCell[] {
  const int = getScheduleInterval(r);
  if (!int) return [];
  const { start, end } = int;
  const fromDay = startOfDay(start);
  const toDay = startOfDay(end);
  if (fromDay.getTime() > toDay.getTime()) return [];
  const days = eachDayOfInterval({ start: fromDay, end: toDay });
  const out: ScheduleCalendarCell[] = [];
  for (const d of days) {
    let at: Date;
    if (isSameDay(d, start)) at = start;
    else if (isSameDay(d, end)) at = end;
    else
      at = set(d, {
        hours: start.getHours(),
        minutes: start.getMinutes(),
        seconds: start.getSeconds(),
        milliseconds: start.getMilliseconds(),
      });
    out.push({ reschedule: r, at });
  }
  return out;
}

function encodeScheduleDrag(id: string, at: Date): string {
  return JSON.stringify({ id, at: at.toISOString() });
}

function parseScheduleDragPayload(
  raw: string,
  fallbackEvents: ScheduleCalendarCell[],
): { id: string; previousAt: Date } | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as { id?: string; at?: string };
    if (j?.id && j?.at) {
      const at = new Date(j.at);
      if (!Number.isNaN(at.getTime())) return { id: j.id, previousAt: at };
    }
  } catch {
  }
  const id = raw.trim();
  const previousAt = fallbackEvents.find((ev) => ev.reschedule._id === id)?.at;
  if (!previousAt) return null;
  return { id, previousAt };
}

function defaultDateTimeForCalendarDay(day: Date): string {
  const hasTime =
    day.getHours() !== 0 ||
    day.getMinutes() !== 0 ||
    day.getSeconds() !== 0 ||
    day.getMilliseconds() !== 0;
  return set(day, {
    hours: hasTime ? day.getHours() : 9,
    minutes: hasTime ? day.getMinutes() : 0,
    seconds: hasTime ? day.getSeconds() : 0,
    milliseconds: hasTime ? day.getMilliseconds() : 0,
  }).toISOString();
}

const DRAG_MIME = "application/x-schedule-id";

type ScheduleMonthCalendarProps = {
  visibleMonth: Date;
  onMonthChange: (next: Date) => void;
  events: ScheduleCalendarCell[];
  onSelectEvent: (r: IReschedule) => void;
  onDayClick?: (day: Date) => void;
  onDropOnDay?: (args: {
    rescheduleId: string;
    targetDate: Date;
    previousAt: Date;
    mode: "month" | "week" | "day";
  }) => void;
};

function ScheduleMonthCalendar({
  visibleMonth,
  onMonthChange,
  events,
  onSelectEvent,
  onDayClick,
  onDropOnDay,
}: ScheduleMonthCalendarProps) {
  type CalendarViewMode = "month" | "week" | "day";
  const dragLockRef = useRef(false);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchorDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const activeLabel = useMemo(() => {
    if (viewMode === "month") return format(visibleMonth, "MMMM yyyy");
    if (viewMode === "week") {
      const a = format(weekStart, "d MMM");
      const b = format(weekEnd, "d MMM yyyy");
      return `${a} – ${b}`;
    }
    return format(anchorDate, "d MMMM yyyy");
  }, [viewMode, visibleMonth, anchorDate, weekStart, weekEnd]);

  const handlePrev = () => {
    if (viewMode === "month") return onMonthChange(addMonths(visibleMonth, -1));
    if (viewMode === "week") return setAnchorDate((d) => addWeeks(d, -1));
    return setAnchorDate((d) => addDays(d, -1));
  };

  const handleNext = () => {
    if (viewMode === "month") return onMonthChange(addMonths(visibleMonth, 1));
    if (viewMode === "week") return setAnchorDate((d) => addWeeks(d, 1));
    return setAnchorDate((d) => addDays(d, 1));
  };

  const byDay = new Map<string, ScheduleCalendarCell[]>();
  for (const cell of events) {
    const key = dayKey(cell.at);
    const list = byDay.get(key) ?? [];
    list.push(cell);
    byDay.set(key, list);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayTimeline = useMemo(() => {
    if (viewMode !== "day") return null;
    const key = dayKey(anchorDate);
    const dayEvents = (byDay.get(key) ?? []).slice();
    dayEvents.sort((a, b) => a.at.getTime() - b.at.getTime());
    const byHour = new Map<number, ScheduleCalendarCell[]>();
    for (const cell of dayEvents) {
      const h = cell.at.getHours();
      const list = byHour.get(h) ?? [];
      list.push(cell);
      byHour.set(h, list);
    }
    return { key, byHour };
  }, [viewMode, anchorDate, byDay]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-200 bg-white px-5 py-4 space-y-3">
        <div className="grid grid-cols-3 items-center gap-2">
          <div className="flex justify-start min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 truncate">
              Calendar
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 shrink-0">
            <Button
              type="button"
              variant="default"
              size="icon-sm"
              className="rounded-md bg-primary! text-primary-foreground!"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[10rem] text-center text-sm font-medium text-zinc-800 tabular-nums">
              {activeLabel}
            </span>
            <Button
              type="button"
              variant="default"
              size="icon-sm"
              className="rounded-md bg-primary! text-primary-foreground!"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-end gap-1 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                DASHBOARD_PRESET_BUTTON_CLASS,
                viewMode !== "day" && "bg-white! text-black!",
                viewMode === "day" && "bg-primary! text-onPrimary!",
              )}
              onClick={() => setViewMode("day")}
            >
              Day
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                DASHBOARD_PRESET_BUTTON_CLASS,
                viewMode !== "week" && "bg-white! text-black!",
                viewMode === "week" && "bg-primary! text-onPrimary!",
              )}
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                DASHBOARD_PRESET_BUTTON_CLASS,
                viewMode !== "month" && "bg-white! text-black!",
                viewMode === "month" && "bg-primary! text-onPrimary!",
              )}
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {(onDayClick || onDropOnDay) ? (
            <p className="text-[11px] text-zinc-500 leading-snug flex-1 min-w-[12rem]">
              Click a date to add a schedule. Drag an event to move it to another day.
            </p>
          ) : (
            <span className="flex-1 min-w-0" />
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2 text-[11px] text-zinc-600 shrink-0">
            {ENTITY_LEGEND.map(({ type, label }) => (
              <span key={type} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: getTargetEntityTypeColor(type) ?? "#64748b",
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {viewMode !== "day" ? (
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              {d}
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={[
          viewMode === "day" || viewMode === "week"
            ? "grid grid-cols-1"
            : "grid grid-cols-7",
          "border-b border-zinc-200 bg-white",
        ].join(" ")}
      >
        {viewMode === "day" && dayTimeline ? (
          <div className="flex flex-col">
            {Array.from({ length: 24 }).map((_, hour) => {
              const rowKey = `${dayTimeline.key}-${hour}`;
              const hourStart = set(anchorDate, {
                hours: hour,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
              });
              const hourEvents = dayTimeline.byHour.get(hour) ?? [];
              const isDraggingOver = dragOverKey === rowKey;

              return (
                <div
                  key={rowKey}
                  className={[
                    "flex min-h-12 border-b border-zinc-200",
                    isDraggingOver ? "ring-2 ring-inset ring-primary/50 bg-primary/5" : "bg-white",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="w-14 shrink-0 px-2 py-2 text-[10px] font-medium tabular-nums text-zinc-500 border-r border-zinc-200 bg-zinc-50/60">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  <div
                    className={[
                      "flex-1 px-2 py-1.5",
                      onDayClick ? "cursor-pointer hover:bg-zinc-50/90" : "",
                    ].join(" ")}
                    role={onDayClick ? "button" : undefined}
                    tabIndex={onDayClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (!onDayClick) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDayClick(hourStart);
                      }
                    }}
                    onClick={() => {
                      if (!onDayClick) return;
                      if (dragLockRef.current) return;
                      onDayClick(hourStart);
                    }}
                    onDragOver={(e) => {
                      if (!onDropOnDay) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverKey(rowKey);
                    }}
                    onDrop={(e) => {
                      if (!onDropOnDay) return;
                      e.preventDefault();
                      setDragOverKey(null);
                      window.setTimeout(() => {
                        dragLockRef.current = false;
                      }, 0);
                      const raw =
                        e.dataTransfer.getData(DRAG_MIME) ||
                        e.dataTransfer.getData("text/plain");
                      const parsed = parseScheduleDragPayload(raw, events);
                      if (!parsed) return;
                      onDropOnDay({
                        rescheduleId: parsed.id,
                        targetDate: hourStart,
                        previousAt: parsed.previousAt,
                        mode: "day",
                      });
                    }}
                    aria-label={
                      onDayClick
                        ? `Add schedule at ${format(hourStart, "h:00 a")} on ${format(anchorDate, "MMMM d, yyyy")}`
                        : undefined
                    }
                  >
                    <div className="flex flex-col gap-1">
                      {hourEvents.map((cell, i) => {
                        const r = cell.reschedule;
                        if (!getScheduleStart(r)) return null;
                        const typeColor = calendarColorForEntityType(r);
                        return (
                          <button
                            key={`${r._id ?? r.rescheduleCode ?? "ev"}-${rowKey}-${cell.at.getTime()}-${i}`}
                            type="button"
                            draggable={Boolean(r._id && onDropOnDay)}
                            title={onDropOnDay && r._id ? "drag to move" : undefined}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onSelectEvent(r);
                            }}
                            onDragStart={(ev) => {
                              if (!r._id || !onDropOnDay) return;
                              ev.stopPropagation();
                              dragLockRef.current = true;
                              const payload = encodeScheduleDrag(r._id, cell.at);
                              ev.dataTransfer.setData(DRAG_MIME, payload);
                              ev.dataTransfer.setData("text/plain", r._id);
                              ev.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => {
                              setDragOverKey(null);
                              window.setTimeout(() => {
                                dragLockRef.current = false;
                              }, 0);
                            }}
                            style={{
                              backgroundColor: `color-mix(in srgb, ${typeColor} 18%, transparent)`,
                              borderColor: `color-mix(in srgb, ${typeColor} 42%, transparent)`,
                            }}
                            className={[
                              "flex w-full min-w-0 items-start rounded border border-solid px-1.5 py-1 text-left transition hover:brightness-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/35",
                              onDropOnDay && r._id
                                ? "cursor-grab active:cursor-grabbing"
                                : "cursor-pointer",
                            ].join(" ")}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[10px] font-semibold leading-tight text-zinc-800">
                                {eventTitle(r)}
                              </span>
                              <span className="mt-0.5 block truncate text-[9px] leading-tight text-zinc-600 tabular-nums">
                                {scheduleCellTimeAndCustomer(r, cell.at)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === "week" ? (
          <div className="flex flex-col min-w-0">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={`week-row-${hour}`}
                className="flex min-h-12 border-b border-zinc-200"
              >
                <div className="w-14 shrink-0 px-2 py-2 text-[10px] font-medium tabular-nums text-zinc-500 border-r border-zinc-200 bg-zinc-50/60">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-7 divide-x divide-zinc-200">
                  {weekDays.map((day) => {
                    const key = dayKey(day);
                    const rowKey = `${key}-${hour}`;
                    const dayEvents = byDay.get(key) ?? [];
                    const hourEvents = dayEvents
                      .filter((cell) => cell.at.getHours() === hour)
                      .sort((a, b) => a.at.getTime() - b.at.getTime());
                    const hourStart = set(day, {
                      hours: hour,
                      minutes: 0,
                      seconds: 0,
                      milliseconds: 0,
                    });
                    const isToday = isSameDay(day, today);
                    const isDraggingOver = dragOverKey === rowKey;

                    return (
                      <div
                        key={rowKey}
                        className={[
                          "relative min-w-0 px-1 py-1.5",
                          isToday ? "bg-primary/8" : "bg-white",
                          isDraggingOver
                            ? "ring-2 ring-inset ring-primary/50 bg-primary/5"
                            : "",
                          onDayClick ? "cursor-pointer hover:bg-zinc-50/90" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        role={onDayClick ? "button" : undefined}
                        tabIndex={onDayClick ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (!onDayClick) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onDayClick(hourStart);
                          }
                        }}
                        onClick={() => {
                          if (!onDayClick) return;
                          if (dragLockRef.current) return;
                          onDayClick(hourStart);
                        }}
                        onDragOver={(e) => {
                          if (!onDropOnDay) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverKey(rowKey);
                        }}
                        onDrop={(e) => {
                          if (!onDropOnDay) return;
                          e.preventDefault();
                          setDragOverKey(null);
                          window.setTimeout(() => {
                            dragLockRef.current = false;
                          }, 0);
                          const raw =
                            e.dataTransfer.getData(DRAG_MIME) ||
                            e.dataTransfer.getData("text/plain");
                          const parsed = parseScheduleDragPayload(raw, events);
                          if (!parsed) return;
                          onDropOnDay({
                            rescheduleId: parsed.id,
                            targetDate: hourStart,
                            previousAt: parsed.previousAt,
                            mode: "day",
                          });
                        }}
                        aria-label={
                          onDayClick
                            ? `Add schedule at ${format(hourStart, "h:00 a")} on ${format(day, "MMMM d, yyyy")}`
                            : undefined
                        }
                      >
                        {isToday ? (
                          <span
                            className="pointer-events-none absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                            aria-hidden
                          />
                        ) : null}
                        <div className="flex flex-col gap-1">
                          {hourEvents.map((cell, i) => {
                            const r = cell.reschedule;
                            if (!getScheduleStart(r)) return null;
                            const typeColor = calendarColorForEntityType(r);
                            return (
                              <button
                                key={`${r._id ?? r.rescheduleCode ?? "ev"}-${rowKey}-${cell.at.getTime()}-${i}`}
                                type="button"
                                draggable={Boolean(r._id && onDropOnDay)}
                                title={
                                  onDropOnDay && r._id ? "drag to move" : undefined
                                }
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  onSelectEvent(r);
                                }}
                                onDragStart={(ev) => {
                                  if (!r._id || !onDropOnDay) return;
                                  ev.stopPropagation();
                                  dragLockRef.current = true;
                                  const payload = encodeScheduleDrag(r._id, cell.at);
                                  ev.dataTransfer.setData(DRAG_MIME, payload);
                                  ev.dataTransfer.setData("text/plain", r._id);
                                  ev.dataTransfer.effectAllowed = "move";
                                }}
                                onDragEnd={() => {
                                  setDragOverKey(null);
                                  window.setTimeout(() => {
                                    dragLockRef.current = false;
                                  }, 0);
                                }}
                                style={{
                                  backgroundColor: `color-mix(in srgb, ${typeColor} 18%, transparent)`,
                                  borderColor: `color-mix(in srgb, ${typeColor} 42%, transparent)`,
                                }}
                                className={[
                                  "flex w-full min-w-0 items-start rounded border border-solid px-1 py-0.5 text-left transition hover:brightness-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/35",
                                  onDropOnDay && r._id
                                    ? "cursor-grab active:cursor-grabbing"
                                    : "cursor-pointer",
                                ].join(" ")}
                              >
                                <span className="min-w-0 flex-1 pl-0.5">
                                  <span className="block truncate text-[9px] font-semibold leading-tight text-zinc-800 sm:text-[10px]">
                                    {eventTitle(r)}
                                  </span>
                                  <span className="mt-px block truncate text-[8px] leading-tight text-zinc-600 sm:text-[9px] tabular-nums">
                                    {scheduleCellTimeAndCustomer(r, cell.at)}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          monthDays.map((day) => {
          const inMonth = isSameMonth(day, visibleMonth);
          const isToday = isSameDay(day, today);
          const key = dayKey(day);
          const dayEvents = byDay.get(key) ?? [];
          const dayEventsSorted = [...dayEvents].sort(
            (a, b) => a.at.getTime() - b.at.getTime(),
          );
          const showEvents = dayEventsSorted.slice(0, 3);
          const extra = dayEventsSorted.length - showEvents.length;
          const isClickableCell = inMonth;
          const isDroppableCell = true;

          return (
            <div
              key={key}
              role={onDayClick && isClickableCell ? "button" : undefined}
              tabIndex={onDayClick && isClickableCell ? 0 : undefined}
              onKeyDown={(e) => {
                if (!onDayClick || !isClickableCell) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDayClick(day);
                }
              }}
              onClick={() => {
                if (!isClickableCell || !onDayClick) return;
                if (dragLockRef.current) return;
                onDayClick(day);
              }}
              onDragOver={(e) => {
                if (!onDropOnDay || !isDroppableCell) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOverKey(key);
              }}
              onDrop={(e) => {
                if (!onDropOnDay || !isDroppableCell) return;
                e.preventDefault();
                setDragOverKey(null);
                window.setTimeout(() => {
                  dragLockRef.current = false;
                }, 0);
                const raw =
                  e.dataTransfer.getData(DRAG_MIME) ||
                  e.dataTransfer.getData("text/plain");
                const parsed = parseScheduleDragPayload(raw, events);
                if (!parsed) return;
                onDropOnDay({
                  rescheduleId: parsed.id,
                  targetDate: day,
                  previousAt: parsed.previousAt,
                  mode: viewMode,
                });
              }}
              className={[
                "relative flex flex-col min-h-[120px] sm:min-h-[132px] border-b border-r border-zinc-200 p-1 sm:p-1.5",
                viewMode !== "day" ? "[&:nth-child(7n)]:border-r-0" : "",
                viewMode === "month" && !inMonth ? "bg-zinc-50/80 opacity-70" : "bg-white",
                isToday ? "ring-1 ring-inset ring-primary/45 bg-primary/8" : "",
                isClickableCell && onDayClick ? "cursor-pointer hover:bg-zinc-50/90" : "",
                onDropOnDay && isDroppableCell && dragOverKey === key
                  ? "ring-2 ring-inset ring-primary/50 bg-primary/5"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={
                onDayClick && isClickableCell
                  ? `Add schedule on ${format(day, "MMMM d, yyyy")}`
                  : undefined
              }
            >
              {isToday && (
                <span
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-sm bg-primary"
                  aria-hidden
                />
              )}
              <div
                className={[
                  "shrink-0 text-left text-xs font-medium tabular-nums pointer-events-none leading-none",
                  isToday ? "text-primary" : inMonth ? "text-zinc-800" : "text-zinc-400",
                ].join(" ")}
              >
                {format(day, "d")}
              </div>
              {dayEventsSorted.length > 0 && (
                <div className="mt-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden pointer-events-auto">
                  {showEvents.map((cell, i) => {
                    const r = cell.reschedule;
                    if (!getScheduleStart(r)) return null;
                    const typeColor = calendarColorForEntityType(r);
                    return (
                      <button
                        key={`${r._id ?? r.rescheduleCode ?? "ev"}-${key}-${cell.at.getTime()}-${i}`}
                        type="button"
                        data-draggable-dot=""
                        draggable={Boolean(r._id && onDropOnDay)}
                        title={
                          onDropOnDay && r._id ? "drag to move" : undefined
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(r);
                        }}
                        onDragStart={(e) => {
                          if (!r._id || !onDropOnDay) return;
                          e.stopPropagation();
                          dragLockRef.current = true;
                          const payload = encodeScheduleDrag(r._id, cell.at);
                          e.dataTransfer.setData(DRAG_MIME, payload);
                          e.dataTransfer.setData("text/plain", r._id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDragOverKey(null);
                          window.setTimeout(() => {
                            dragLockRef.current = false;
                          }, 0);
                        }}
                        style={{
                          backgroundColor: `color-mix(in srgb, ${typeColor} 18%, transparent)`,
                          borderColor: `color-mix(in srgb, ${typeColor} 42%, transparent)`,
                        }}
                        className={[
                          "flex w-full min-w-0 items-start rounded border border-solid px-1 py-0.5 text-left transition hover:brightness-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/35",
                          onDropOnDay && r._id ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                        ].join(" ")}
                      >
                        <span className="min-w-0 flex-1 pl-0.5">
                          <span className="block truncate text-[9px] font-semibold leading-tight text-zinc-800 sm:text-[10px]">
                            {eventTitle(r)}
                          </span>
                          <span className="mt-px block truncate text-[8px] leading-tight text-zinc-600 sm:text-[9px]">
                            {scheduleCellTimeAndCustomer(r, cell.at)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  {extra > 0 && (
                    <div
                      className="px-0.5 pt-0.5 text-center text-[9px] font-medium text-zinc-500"
                      onClick={(e) => e.stopPropagation()}
                      title={`${extra} more on this day`}
                    >
                      +{extra} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}

export default function ReschedulesScheduler() {
  const navigate = useNavigate();
  const [fetchQuery, fetchState] = useLazyGetReschedulesQuery();
  const [updateReschedule] = useUpdateRescheduleMutation();

  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<IReschedule | null>(null);

  type OptimisticScheduleDates = {
    newDateTime: string;
    from: string;
    to: string;
  };
  const [optimisticScheduleById, setOptimisticScheduleById] = useState<
    Record<string, OptimisticScheduleDates>
  >({});

  const effectiveRange = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const start = startOfDay(gridStart);
    const end = endOfDay(gridEnd);
    return { start, end };
  }, [visibleMonth]);

  const startDateIso = effectiveRange.start.toISOString();
  const endDateIso = effectiveRange.end.toISOString();

  useEffect(() => {
    fetchQuery({
      pageIndex: 1,
      search: searchQuery ?? undefined,
      filters: {
        startDate: startDateIso,
        endDate: endDateIso,
      },
    });
  }, [fetchQuery, searchQuery, startDateIso, endDateIso]);

  const all = (fetchState.data?.contents ?? []) as IReschedule[];

  const allWithOptimisticDates = useMemo(() => {
    return all.map((r) => {
      const id = r._id;
      if (!id) return r;
      const o = optimisticScheduleById[id];
      return o
        ? { ...r, newDateTime: o.newDateTime, from: o.from, to: o.to }
        : r;
    });
  }, [all, optimisticScheduleById]);

  useEffect(() => {
    setOptimisticScheduleById((prev) => {
      const ids = Object.keys(prev);
      if (!ids.length) return prev;
      let changed = false;
      const next = { ...prev };
      for (const id of ids) {
        const row = all.find((r) => r._id === id);
        const want = prev[id];
        if (
          row?.newDateTime &&
          want &&
          new Date(row.newDateTime).getTime() ===
            new Date(want.newDateTime).getTime() &&
          (!row.from ||
            new Date(row.from).getTime() === new Date(want.from).getTime()) &&
          (!row.to ||
            new Date(row.to).getTime() === new Date(want.to).getTime())
        ) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [all]);

  const eventsInRange = useMemo(() => {
    return allWithOptimisticDates
      .filter((r) => {
        const int = getScheduleInterval(r);
        if (!int) return false;
        return !(
          int.end < effectiveRange.start || int.start > effectiveRange.end
        );
      })
      .sort(
        (a, b) =>
          (getScheduleStart(a)?.getTime() ?? 0) -
          (getScheduleStart(b)?.getTime() ?? 0),
      );
  }, [allWithOptimisticDates, effectiveRange.start, effectiveRange.end]);

  const openDetails = (r: IReschedule) => {
    setSelected(r);
    setDrawerOpen(true);
  };

  const calendarEvents = useMemo(() => {
    const out: ScheduleCalendarCell[] = [];
    for (const r of eventsInRange) {
      out.push(...expandRescheduleToCalendarCells(r));
    }
    out.sort((a, b) => {
      const t = a.at.getTime() - b.at.getTime();
      if (t !== 0) return t;
      return (a.reschedule._id ?? "").localeCompare(
        b.reschedule._id ?? "",
      );
    });
    return out;
  }, [eventsInRange]);

  const handleCalendarDayClick = useCallback(
    (day: Date) => {
      const iso = defaultDateTimeForCalendarDay(day);
      navigate(allRoutes.PORTAL + allRoutes.ADD_RESCHEDULE, {
        state: {
          initialData: {
            newDateTime: iso,
            originalDateTime: iso,
            from: iso,
            to: iso,
          } as IReschedule,
        },
      });
    },
    [navigate],
  );

  const handleDropOnDay = useCallback(
    async ({
      rescheduleId,
      targetDate,
      previousAt,
      mode,
    }: {
      rescheduleId: string;
      targetDate: Date;
      previousAt: Date;
      mode: "month" | "week" | "day";
    }) => {
      const row = allWithOptimisticDates.find((r) => r._id === rescheduleId);
      if (!row?._id) return;

      const prevFrom = getScheduleStart(row);
      if (!prevFrom) return;
      const prevTo = getScheduleEnd(row) ?? prevFrom;
      const prevNew = parseRescheduleDate(row.newDateTime) ?? prevFrom;

      let newFromIso: string;
      let newToIso: string;
      let newNewIso: string;

      if (mode === "day") {
        const newAnchor = set(targetDate, {
          hours: targetDate.getHours(),
          minutes: previousAt.getMinutes(),
          seconds: previousAt.getSeconds(),
          milliseconds: previousAt.getMilliseconds(),
        });
        const deltaMs = newAnchor.getTime() - previousAt.getTime();
        newFromIso = new Date(prevFrom.getTime() + deltaMs).toISOString();
        newToIso = new Date(prevTo.getTime() + deltaMs).toISOString();
        newNewIso = new Date(prevNew.getTime() + deltaMs).toISOString();
      } else {
        const dayDelta = differenceInCalendarDays(
          startOfDay(targetDate),
          startOfDay(previousAt),
        );
        newFromIso = addDays(prevFrom, dayDelta).toISOString();
        newToIso = addDays(prevTo, dayDelta).toISOString();
        newNewIso = addDays(prevNew, dayDelta).toISOString();
      }

      if (mode !== "day" && dayKey(previousAt) === dayKey(targetDate)) return;

      const optimistic: OptimisticScheduleDates = {
        newDateTime: newNewIso,
        from: newFromIso,
        to: newToIso,
      };
      setOptimisticScheduleById((prev) => ({
        ...prev,
        [rescheduleId]: optimistic,
      }));

      try {
        await updateReschedule({
          _id: rescheduleId,
          newDateTime: newNewIso,
          from: newFromIso,
          to: newToIso,
        }).unwrap();
        showToast({
          title: "Success",
          message: "Schedule moved to the new date.",
          type: "success",
        });
      } catch {
        setOptimisticScheduleById((prev) => {
          const next = { ...prev };
          delete next[rescheduleId];
          return next;
        });
        showToast({
          title: "Error",
          message: "Could not move this schedule.",
          type: "error",
        });
      }
    },
    [updateReschedule, allWithOptimisticDates],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <PageTitle
          showBack
          title="Scheduler"
          subtext="Calendar view for scheduled activities"
        />
        <div className="flex items-center gap-2">
          <ActionButton
            type="view"
            useText="List"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.RESCHEDULES)
            }
          />
          <ActionButton
            type="add"
            useText="Add Schedules"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.ADD_RESCHEDULE)
            }
          />
        </div>
      </div>

      <CardComponent
        className="rounded-md"
        headerTitle={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-4">
              <p className="text-sm font-thin flex flex-col">
                <span className="text-[10px]">Showing</span>
                <span className="text-lg md:text-2xl font-bold">
                  {eventsInRange.length}
                </span>
              </p>
              <SearchComponent returnSearchKey={(k) => setSearchQuery(k)} />
            </div>
          </div>
        }
      >
        {(fetchState.isFetching || fetchState.isLoading) && (
          <LoadingComponent loading />
        )}

        <div className="scheduler-calendar w-full min-w-0 max-w-full overflow-x-auto p-1">
          <ScheduleMonthCalendar
            visibleMonth={visibleMonth}
            onMonthChange={setVisibleMonth}
            events={calendarEvents}
            onSelectEvent={openDetails}
            onDayClick={handleCalendarDayClick}
            onDropOnDay={handleDropOnDay}
          />
        </div>
      </CardComponent>

      <RescheduleDetailsDrawer
        reschedule={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
