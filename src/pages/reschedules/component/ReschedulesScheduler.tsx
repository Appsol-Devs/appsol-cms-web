import CardComponent from "@/components/CardComponent";
import LoadingComponent from "@/components/LoadingComponent";
import PageTitle from "@/components/PageTitle";
import SearchComponent from "@/components/SearchComponent";
import ActionButton from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { allRoutes } from "@/utils/routes";
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
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
import type { IReschedule, TargetEntityType } from "../common/reschedules";
import {
  useLazyGetReschedulesQuery,
  useUpdateRescheduleMutation,
} from "../common/reschedulesApi";
import RescheduleDetailsDrawer from "./RescheduleDetailsDrawer";

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

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function getNewDate(res: IReschedule): Date | null {
  if (!res?.newDateTime) return null;
  const d = new Date(res.newDateTime);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inRange(d: Date, range: { start: Date; end: Date }) {
  return isWithinInterval(d, { start: range.start, end: range.end });
}

function defaultDateTimeForCalendarDay(day: Date): string {
  return set(day, {
    hours: 9,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }).toISOString();
}

function mergeTargetDayPreserveTime(at: Date, targetDay: Date): string {
  return set(targetDay, {
    hours: at.getHours(),
    minutes: at.getMinutes(),
    seconds: at.getSeconds(),
    milliseconds: at.getMilliseconds(),
  }).toISOString();
}

const DRAG_MIME = "application/x-schedule-id";

type ScheduleMonthCalendarProps = {
  visibleMonth: Date;
  onMonthChange: (next: Date) => void;
  events: { reschedule: IReschedule; at: Date }[];
  onSelectEvent: (r: IReschedule) => void;
  onDayClick?: (day: Date) => void;
  onDropOnDay?: (args: {
    rescheduleId: string;
    targetDay: Date;
    previousAt: Date;
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
  const dragLockRef = useRef(false);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const byDay = new Map<string, IReschedule[]>();
  for (const { reschedule, at } of events) {
    const key = dayKey(at);
    const list = byDay.get(key) ?? [];
    list.push(reschedule);
    byDay.set(key, list);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
              onClick={() => onMonthChange(addMonths(visibleMonth, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[10rem] text-center text-sm font-medium text-zinc-800 tabular-nums">
              {format(visibleMonth, "MMMM yyyy")}
            </span>
            <Button
              type="button"
              variant="default"
              size="icon-sm"
              className="rounded-md bg-primary! text-primary-foreground!"
              onClick={() => onMonthChange(addMonths(visibleMonth, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div aria-hidden className="min-w-0" />
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

      <div className="grid grid-cols-7 border-b border-zinc-200 bg-white">
        {days.map((day) => {
          const inMonth = isSameMonth(day, visibleMonth);
          const isToday = isSameDay(day, today);
          const key = dayKey(day);
          const dayEvents = byDay.get(key) ?? [];
          const dayEventsSorted = [...dayEvents].sort((a, b) => {
            const ta = getNewDate(a)?.getTime() ?? 0;
            const tb = getNewDate(b)?.getTime() ?? 0;
            return ta - tb;
          });
          const showEvents = dayEventsSorted.slice(0, 3);
          const extra = dayEventsSorted.length - showEvents.length;

          return (
            <div
              key={key}
              role={onDayClick && inMonth ? "button" : undefined}
              tabIndex={onDayClick && inMonth ? 0 : undefined}
              onKeyDown={(e) => {
                if (!onDayClick || !inMonth) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDayClick(day);
                }
              }}
              onClick={() => {
                if (!inMonth || !onDayClick) return;
                if (dragLockRef.current) return;
                onDayClick(day);
              }}
              onDragOver={(e) => {
                if (!onDropOnDay || !inMonth) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOverKey(key);
              }}
              onDrop={(e) => {
                if (!onDropOnDay || !inMonth) return;
                e.preventDefault();
                setDragOverKey(null);
                const id =
                  e.dataTransfer.getData(DRAG_MIME) ||
                  e.dataTransfer.getData("text/plain");
                if (!id) return;
                const prevAt = events.find(
                  (ev) => ev.reschedule._id === id,
                )?.at;
                if (!prevAt) return;
                onDropOnDay({
                  rescheduleId: id,
                  targetDay: day,
                  previousAt: prevAt,
                });
              }}
              className={[
                "relative flex flex-col min-h-[120px] sm:min-h-[132px] border-b border-r border-zinc-200 p-1 sm:p-1.5",
                "[&:nth-child(7n)]:border-r-0",
                !inMonth ? "bg-zinc-50/80 opacity-70" : "bg-white",
                isToday ? "ring-1 ring-inset ring-primary/45 bg-primary/8" : "",
                inMonth && onDayClick ? "cursor-pointer hover:bg-zinc-50/90" : "",
                onDropOnDay && inMonth && dragOverKey === key
                  ? "ring-2 ring-inset ring-primary/50 bg-primary/5"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={
                onDayClick && inMonth
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
                  {showEvents.map((r, i) => {
                    const at = getNewDate(r);
                    if (!at) return null;
                    const cust = customerFirstName(r);
                    const typeColor = calendarColorForEntityType(r);
                    return (
                      <button
                        key={`${r._id ?? r.rescheduleCode ?? "ev"}-${key}-${i}`}
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
                          e.dataTransfer.setData(DRAG_MIME, r._id);
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
                            {format(at, "HH:mm")}
                            {cust ? ` · ${cust}` : ""}
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
        })}
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

  const [optimisticNewDateById, setOptimisticNewDateById] = useState<
    Record<string, string>
  >({});

  const pageSize = 1000;

  const effectiveRange = useMemo(() => {
    const start = startOfDay(startOfMonth(visibleMonth));
    const end = endOfDay(endOfMonth(visibleMonth));
    return { start, end };
  }, [visibleMonth]);

  const startDateIso = effectiveRange.start.toISOString();
  const endDateIso = effectiveRange.end.toISOString();

  useEffect(() => {
    fetchQuery({
      pageIndex: 1,
      pageSize,
      search: searchQuery ?? undefined,
      filters: {
        startDate: startDateIso,
        endDate: endDateIso,
      },
    });
  }, [fetchQuery, pageSize, searchQuery, startDateIso, endDateIso]);

  const all = (fetchState.data?.contents ?? []) as IReschedule[];

  const allWithOptimisticDates = useMemo(() => {
    return all.map((r) => {
      const id = r._id;
      if (!id) return r;
      const o = optimisticNewDateById[id];
      return o ? { ...r, newDateTime: o } : r;
    });
  }, [all, optimisticNewDateById]);

  useEffect(() => {
    setOptimisticNewDateById((prev) => {
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
          new Date(row.newDateTime).getTime() === new Date(want).getTime()
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
      .map((r) => ({ r, d: getNewDate(r) }))
      .filter((x): x is { r: IReschedule; d: Date } => !!x.d)
      .filter(({ d }) => inRange(d, effectiveRange))
      .sort((a, b) => a.d.getTime() - b.d.getTime());
  }, [allWithOptimisticDates, effectiveRange.start, effectiveRange.end]);

  const openDetails = (r: IReschedule) => {
    setSelected(r);
    setDrawerOpen(true);
  };

  const calendarEvents = useMemo(
    () => eventsInRange.map(({ r, d }) => ({ reschedule: r, at: d })),
    [eventsInRange],
  );

  const handleCalendarDayClick = useCallback(
    (day: Date) => {
      const iso = defaultDateTimeForCalendarDay(day);
      navigate(allRoutes.PORTAL + allRoutes.ADD_RESCHEDULE, {
        state: {
          initialData: {
            newDateTime: iso,
            originalDateTime: iso,
          } as IReschedule,
        },
      });
    },
    [navigate],
  );

  const handleDropOnDay = useCallback(
    async ({
      rescheduleId,
      targetDay,
      previousAt,
    }: {
      rescheduleId: string;
      targetDay: Date;
      previousAt: Date;
    }) => {
      const newIso = mergeTargetDayPreserveTime(previousAt, targetDay);
      if (dayKey(previousAt) === dayKey(targetDay)) return;

      setOptimisticNewDateById((prev) => ({
        ...prev,
        [rescheduleId]: newIso,
      }));

      try {
        await updateReschedule({
          _id: rescheduleId,
          newDateTime: newIso,
        }).unwrap();
        showToast({
          title: "Success",
          message: "Schedule moved to the new date.",
          type: "success",
        });
      } catch {
        setOptimisticNewDateById((prev) => {
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
    [updateReschedule],
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
