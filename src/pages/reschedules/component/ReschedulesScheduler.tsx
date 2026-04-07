import CardComponent from "@/components/CardComponent";
import LoadingComponent from "@/components/LoadingComponent";
import PageTitle from "@/components/PageTitle";
import SearchComponent from "@/components/SearchComponent";
import ActionButton from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
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
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
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
import { useLazyGetReschedulesQuery, useUpdateRescheduleMutation } from "../common/reschedulesApi";
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

function isMultiDayReschedule(r: IReschedule): boolean {
  const int = getScheduleInterval(r);
  if (!int) return false;
  return (
    differenceInCalendarDays(startOfDay(int.end), startOfDay(int.start)) >= 1
  );
}

function rescheduleStableKey(r: IReschedule): string {
  return r._id ?? r.rescheduleCode ?? "";
}

type RangeBarSegment = {
  r: IReschedule;
  colStart: number;
  colEnd: number;
  at?: Date;
};

function segmentSortTime(s: RangeBarSegment): number {
  return (s.at ?? getScheduleStart(s.r))?.getTime() ?? 0;
}

function segmentDisplayAt(seg: RangeBarSegment, weekDays: Date[]): Date {
  if (seg.at) return seg.at;
  const start = getScheduleStart(seg.r);
  if (!start) return new Date();
  const mid = weekDays[Math.max(0, seg.colStart - 1)];
  if (mid != null) {
    return set(mid, {
      hours: start.getHours(),
      minutes: start.getMinutes(),
      seconds: start.getSeconds(),
      milliseconds: start.getMilliseconds(),
    });
  }
  return start;
}

function weekHourAllSegments(
  hour: number,
  weekDays: Date[],
  multiDayList: IReschedule[],
  byDay: Map<string, ScheduleCalendarCell[]>,
): RangeBarSegment[] {
  const multi = weekHourRangeSegments(hour, weekDays, multiDayList);
  const singles: RangeBarSegment[] = [];
  weekDays.forEach((day, idx) => {
    const key = dayKey(day);
    for (const cell of byDay.get(key) ?? []) {
      if (isMultiDayReschedule(cell.reschedule)) continue;
      if (cell.at.getHours() !== hour) continue;
      singles.push({
        r: cell.reschedule,
        colStart: idx + 1,
        colEnd: idx + 1,
        at: cell.at,
      });
    }
  });
  return [...multi, ...singles];
}

function monthWeekAllSegments(
  weekDays: Date[],
  multiDayList: IReschedule[],
  byDay: Map<string, ScheduleCalendarCell[]>,
): RangeBarSegment[] {
  const multi = monthWeekRangeSegments(weekDays, multiDayList);
  const singles: RangeBarSegment[] = [];
  weekDays.forEach((day, idx) => {
    const key = dayKey(day);
    for (const cell of byDay.get(key) ?? []) {
      if (isMultiDayReschedule(cell.reschedule)) continue;
      singles.push({
        r: cell.reschedule,
        colStart: idx + 1,
        colEnd: idx + 1,
        at: cell.at,
      });
    }
  });
  return [...multi, ...singles];
}

function monthSegmentRowKey(seg: RangeBarSegment): string {
  return `${rescheduleStableKey(seg.r)}-${seg.colStart}-${seg.colEnd}-${seg.at?.getTime() ?? 0}`;
}

function monthSegmentsAfterStartColumnCap(
  allSegs: RangeBarSegment[],
  maxPerDay: number,
): RangeBarSegment[] {
  if (allSegs.length === 0 || maxPerDay <= 0) return [];
  const sortOverlapping = (col: number) =>
    allSegs
      .filter((s) => s.colStart <= col && s.colEnd >= col)
      .sort((a, b) => {
        const t = segmentSortTime(a) - segmentSortTime(b);
        if (t !== 0) return t;
        return monthSegmentRowKey(a).localeCompare(monthSegmentRowKey(b));
      });

  const allowed = new Set<string>();
  for (const seg of allSegs) {
    const anchorCol = seg.colStart;
    const overlapping = sortOverlapping(anchorCol);
    const top = overlapping.slice(0, maxPerDay);
    if (top.some((s) => monthSegmentRowKey(s) === monthSegmentRowKey(seg))) {
      allowed.add(monthSegmentRowKey(seg));
    }
  }
  return allSegs.filter((s) => allowed.has(monthSegmentRowKey(s)));
}

function monthWeekRangeSegments(
  weekDays: Date[],
  multiDayList: IReschedule[],
): RangeBarSegment[] {
  const segments: RangeBarSegment[] = [];
  const w0 = startOfDay(weekDays[0]);
  const w6 = startOfDay(weekDays[6]);
  for (const r of multiDayList) {
    const int = getScheduleInterval(r);
    if (!int) continue;
    const s = startOfDay(int.start);
    const e = startOfDay(int.end);
    const overlapStart = s > w0 ? s : w0;
    const overlapEnd = e < w6 ? e : w6;
    if (overlapStart > overlapEnd) continue;
    const colStart = differenceInCalendarDays(overlapStart, w0) + 1;
    const colEnd = differenceInCalendarDays(overlapEnd, w0) + 1;
    segments.push({ r, colStart, colEnd });
  }
  return segments;
}

function weekHourRangeSegments(
  hour: number,
  weekDays: Date[],
  multiDayList: IReschedule[],
): RangeBarSegment[] {
  const segments: RangeBarSegment[] = [];
  const w0 = startOfDay(weekDays[0]);
  const w6 = startOfDay(weekDays[6]);
  for (const r of multiDayList) {
    const int = getScheduleInterval(r);
    if (!int) continue;
    if (getScheduleStart(r)?.getHours() !== hour) continue;
    const s = startOfDay(int.start);
    const e = startOfDay(int.end);
    const overlapStart = s > w0 ? s : w0;
    const overlapEnd = e < w6 ? e : w6;
    if (overlapStart > overlapEnd) continue;
    const colStart = differenceInCalendarDays(overlapStart, w0) + 1;
    const colEnd = differenceInCalendarDays(overlapEnd, w0) + 1;
    segments.push({ r, colStart, colEnd });
  }
  return segments;
}

function packRangeSegmentsIntoLanes(
  segments: RangeBarSegment[],
): RangeBarSegment[][] {
  const sorted = [...segments].sort((a, b) => {
    const ta = segmentSortTime(a);
    const tb = segmentSortTime(b);
    if (ta !== tb) return ta - tb;
    const c = a.colStart - b.colStart;
    if (c !== 0) return c;
    const e = a.colEnd - b.colEnd;
    if (e !== 0) return e;
    return (a.r._id ?? "").localeCompare(b.r._id ?? "");
  });
  const lanes: RangeBarSegment[][] = [];
  for (const seg of sorted) {
    let placed = false;
    for (const lane of lanes) {
      const ok = lane.every(
        (x) => x.colEnd < seg.colStart || x.colStart > seg.colEnd,
      );
      if (ok) {
        lane.push(seg);
        placed = true;
        break;
      }
    }
    if (!placed) lanes.push([seg]);
  }
  return lanes;
}

function chunkMonthDaysIntoWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function cellsToSingleColumnSegments(
  cells: ScheduleCalendarCell[],
): RangeBarSegment[] {
  return cells.map((cell) => ({
    r: cell.reschedule,
    colStart: 1,
    colEnd: 1,
    at: cell.at,
  }));
}

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

type ScheduleSegmentLanePillProps = {
  seg: RangeBarSegment;
  weekDays: Date[];
  gridColumn?: string;
  gridRow?: number;
  density: "day" | "week" | "month";
  onSelectEvent: (r: IReschedule) => void;
  onDropOnDay?: ScheduleMonthCalendarProps["onDropOnDay"];
  dragLockRef: MutableRefObject<boolean>;
  setDragOverKey: (k: string | null) => void;
};

function ScheduleSegmentLanePill({
  seg,
  weekDays,
  gridColumn,
  gridRow,
  density,
  onSelectEvent,
  onDropOnDay,
  dragLockRef,
  setDragOverKey,
}: ScheduleSegmentLanePillProps) {
  const r = seg.r;
  if (!getScheduleStart(r)) return null;
  const displayAt = segmentDisplayAt(seg, weekDays);
  const dragAt = displayAt;
  const typeColor = calendarColorForEntityType(r);
  const pad = density === "day" ? "px-1.5 py-1" : "px-1 py-0.5";
  const titleCls =
    density === "day"
      ? "text-[10px] font-semibold leading-tight text-zinc-800"
      : "text-[9px] font-semibold leading-tight text-zinc-800 sm:text-[10px]";
  const subCls =
    density === "day"
      ? "text-[9px] leading-tight text-zinc-600 tabular-nums"
      : "mt-px text-[8px] leading-tight text-zinc-600 sm:text-[9px] tabular-nums";
  const mx = density === "month" ? "mx-px" : "";
  const gridPlacement =
    gridColumn != null && gridRow != null
      ? { gridColumn, gridRow }
      : undefined;

  return (
    <button
      type="button"
      draggable={Boolean(r._id && onDropOnDay)}
      title={onDropOnDay && r._id ? "drag to move" : undefined}
      style={{
        ...gridPlacement,
        backgroundColor: `color-mix(in srgb, ${typeColor} 18%, transparent)`,
        borderColor: `color-mix(in srgb, ${typeColor} 42%, transparent)`,
      }}
      className={[
        "pointer-events-auto flex w-full min-w-0 items-start rounded border border-solid text-left transition hover:brightness-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/35",
        pad,
        mx,
        onDropOnDay && r._id
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={(ev) => {
        ev.stopPropagation();
        onSelectEvent(r);
      }}
      onDragStart={(ev) => {
        if (!r._id || !onDropOnDay) return;
        ev.stopPropagation();
        dragLockRef.current = true;
        const payload = encodeScheduleDrag(r._id, dragAt);
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
    >
      <span className="min-w-0 flex-1 pl-0.5">
        <span className={`block truncate ${titleCls}`}>{eventTitle(r)}</span>
        <span className={`block truncate ${subCls}`}>
          {scheduleCellTimeAndCustomer(r, displayAt)}
        </span>
      </span>
    </button>
  );
}

type MonthDayOverflowPopoverProps = {
  day: Date;
  weekDays: Date[];
  hiddenSegments: RangeBarSegment[];
  onSelectEvent: (r: IReschedule) => void;
  onDropOnDay?: ScheduleMonthCalendarProps["onDropOnDay"];
  dragLockRef: MutableRefObject<boolean>;
  setDragOverKey: (k: string | null) => void;
};

function MonthDayOverflowPopover({
  day,
  weekDays,
  hiddenSegments,
  onSelectEvent,
  onDropOnDay,
  dragLockRef,
  setDragOverKey,
}: MonthDayOverflowPopoverProps) {
  const [open, setOpen] = useState(false);
  const n = hiddenSegments.length;
  if (n <= 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <a
          href="#"
          aria-haspopup="dialog"
          aria-expanded={open}
          className="relative z-[15] mt-1 block w-full shrink-0 text-center text-[9px] font-medium text-primary underline underline-offset-2 hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/35 rounded-sm pointer-events-auto"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          aria-label={`View ${n} more events on ${format(day, "MMMM d")}`}
        >
          + {n} events
        </a>
      </PopoverAnchor>
      <PopoverContent
        className="w-[min(13rem,calc(100vw-1.25rem))] p-1.5 shadow-sm"
        align="center"
        side="top"
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="flex flex-col gap-0.5 p-0">
          {hiddenSegments.map((seg) => {
            if (!getScheduleStart(seg.r)) return null;
            return (
              <li key={monthSegmentRowKey(seg)} className="list-none">
                <ScheduleSegmentLanePill
                  seg={seg}
                  weekDays={weekDays}
                  density="month"
                  onSelectEvent={(r) => {
                    onSelectEvent(r);
                    setOpen(false);
                  }}
                  onDropOnDay={onDropOnDay}
                  dragLockRef={dragLockRef}
                  setDragOverKey={setDragOverKey}
                />
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

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
  for (const list of byDay.values()) {
    list.sort((a, b) => {
      const t = a.at.getTime() - b.at.getTime();
      if (t !== 0) return t;
      return (a.reschedule._id ?? "").localeCompare(
        b.reschedule._id ?? "",
      );
    });
  }

  const multiDaySchedules = useMemo(() => {
    const m = new Map<string, IReschedule>();
    for (const cell of events) {
      const r = cell.reschedule;
      if (!isMultiDayReschedule(r)) continue;
      const k = rescheduleStableKey(r) || `anon-${eventTitle(r)}`;
      m.set(k, r);
    }
    return [...m.values()];
  }, [events]);

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
            : "flex flex-col",
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
              const hourSegs = cellsToSingleColumnSegments(hourEvents);
              const dayRangeLanes = packRangeSegmentsIntoLanes(hourSegs);
              const dayWeekCol = [anchorDate];
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
                      "flex min-h-12 min-w-0 flex-1 flex-col px-2 py-1.5",
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
                    {dayRangeLanes.length > 0 ? (
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        {dayRangeLanes.flatMap((lane, li) =>
                          lane.map((seg) => (
                            <ScheduleSegmentLanePill
                              key={`dseg-${rowKey}-${li}-${segmentSortTime(seg)}-${rescheduleStableKey(seg.r)}`}
                              seg={seg}
                              weekDays={dayWeekCol}
                              density="day"
                              onSelectEvent={onSelectEvent}
                              onDropOnDay={onDropOnDay}
                              dragLockRef={dragLockRef}
                              setDragOverKey={setDragOverKey}
                            />
                          )),
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === "week" ? (
          <div className="flex flex-col min-w-0">
            {Array.from({ length: 24 }).map((_, hour) => {
              const weekHourSegs = weekHourAllSegments(
                hour,
                weekDays,
                multiDaySchedules,
                byDay,
              );
              const weekRangeLanes = packRangeSegmentsIntoLanes(weekHourSegs);
              const weekRowMinH = Math.max(48, 6 + weekRangeLanes.length * 36);

              return (
              <div
                key={`week-row-${hour}`}
                className="flex border-b border-zinc-200"
                style={{ minHeight: weekRowMinH }}
              >
                <div className="w-14 shrink-0 px-2 py-2 text-[10px] font-medium tabular-nums text-zinc-500 border-r border-zinc-200 bg-zinc-50/60">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="relative min-w-0 flex-1">
                <div className="relative z-[1] grid min-h-12 min-w-0 grid-cols-7 divide-x divide-zinc-200 isolate">
                  {weekDays.map((day) => {
                    const key = dayKey(day);
                    const rowKey = `${key}-${hour}`;
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
                            mode: "week",
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
                      </div>
                    );
                  })}
                </div>
                {weekRangeLanes.length > 0 ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-[2] grid auto-rows-auto grid-cols-7 content-start gap-y-0.5 px-0.5 pt-0.5"
                    aria-hidden={false}
                  >
                    {weekRangeLanes.flatMap((lane, li) =>
                      lane.map((seg) => (
                        <ScheduleSegmentLanePill
                          key={`wseg-${hour}-${li}-${seg.colStart}-${seg.colEnd}-${segmentSortTime(seg)}-${rescheduleStableKey(seg.r)}`}
                          seg={seg}
                          weekDays={weekDays}
                          gridColumn={`${seg.colStart} / ${seg.colEnd + 1}`}
                          gridRow={li + 1}
                          density="week"
                          onSelectEvent={onSelectEvent}
                          onDropOnDay={onDropOnDay}
                          dragLockRef={dragLockRef}
                          setDragOverKey={setDragOverKey}
                        />
                      )),
                    )}
                  </div>
                ) : null}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          chunkMonthDaysIntoWeeks(monthDays).map((week) => {
            const monthWeekSegs = monthWeekAllSegments(
              week,
              multiDaySchedules,
              byDay,
            );
            const MONTH_VISIBLE_EVENTS_PER_DAY = 2;
            const monthWeekSegsVisible = monthSegmentsAfterStartColumnCap(
              monthWeekSegs,
              MONTH_VISIBLE_EVENTS_PER_DAY,
            );
            const rangeLanes = packRangeSegmentsIntoLanes(monthWeekSegsVisible);

            const monthDateBlockPx = 18;
            const monthGapAfterDatePx = 4;
            const monthRangeOverlayTopPx =
              monthDateBlockPx + monthGapAfterDatePx;
            const monthRangeLaneH = 18;
            const monthRangeBandBottomPx =
              monthRangeOverlayTopPx +
              rangeLanes.length * (monthRangeLaneH + 2) +
              6;
            const monthWeekRowMinPx = Math.max(132, monthRangeBandBottomPx + 16);
            const monthVisibleKeySet = new Set(
              monthWeekSegsVisible.map(monthSegmentRowKey),
            );

            return (
              <div
                key={dayKey(week[0])}
                className="relative grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/35 last:border-b-0"
                style={{ minHeight: monthWeekRowMinPx }}
              >
                {rangeLanes.length > 0 ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-[5] grid grid-cols-7 gap-x-px px-0.5"
                    style={{
                      top: monthRangeOverlayTopPx,
                      gridTemplateRows: `repeat(${rangeLanes.length}, minmax(${monthRangeLaneH}px, auto))`,
                      rowGap: 2,
                    }}
                  >
                    {rangeLanes.flatMap((lane, li) =>
                      lane.map((seg) => (
                        <ScheduleSegmentLanePill
                          key={`mseg-${dayKey(week[0])}-${li}-${monthSegmentRowKey(seg)}`}
                          seg={seg}
                          weekDays={week}
                          gridColumn={`${seg.colStart} / ${seg.colEnd + 1}`}
                          gridRow={li + 1}
                          density="month"
                          onSelectEvent={onSelectEvent}
                          onDropOnDay={onDropOnDay}
                          dragLockRef={dragLockRef}
                          setDragOverKey={setDragOverKey}
                        />
                      )),
                    )}
                  </div>
                ) : null}
                {week.map((day, dayIndex) => {
          const inMonth = isSameMonth(day, visibleMonth);
          const isToday = isSameDay(day, today);
          const key = dayKey(day);
          const weekColumn = dayIndex + 1;
          const hiddenSegments = monthWeekSegs
            .filter(
              (s) =>
                s.colStart <= weekColumn &&
                s.colEnd >= weekColumn &&
                !monthVisibleKeySet.has(monthSegmentRowKey(s)),
            )
            .sort((a, b) => {
              const t = segmentSortTime(a) - segmentSortTime(b);
              if (t !== 0) return t;
              return monthSegmentRowKey(a).localeCompare(monthSegmentRowKey(b));
            });
          const isClickableCell = inMonth;
          const isDroppableCell = true;

          const monthCellBgClass =
            viewMode === "month" && rangeLanes.length > 0
              ? ""
              : viewMode === "month" && !inMonth
                ? "bg-zinc-50/80 opacity-70"
                : isToday
                  ? "bg-primary/8"
                  : "bg-white";

          const monthCellBgStyle =
            viewMode === "month" && rangeLanes.length > 0
              ? {
                  backgroundImage: !inMonth
                    ? `linear-gradient(to bottom, transparent 0px, transparent ${monthRangeBandBottomPx}px, rgba(249,250,251,0.92) ${monthRangeBandBottomPx}px)`
                    : isToday
                      ? `linear-gradient(to bottom, transparent 0px, transparent ${monthRangeBandBottomPx}px, rgba(236,253,245,0.96) ${monthRangeBandBottomPx}px)`
                      : `linear-gradient(to bottom, transparent 0px, transparent ${monthRangeBandBottomPx}px, white ${monthRangeBandBottomPx}px)`,
                }
              : undefined;

          return (
            <div
              key={key}
              style={monthCellBgStyle}
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
                "relative z-[1] flex flex-col min-h-[120px] sm:min-h-[132px] border-b border-r border-zinc-200 p-1 sm:p-1.5",
                dayIndex === 6 ? "border-r-0" : "",
                monthCellBgClass,
                isToday ? "ring-1 ring-inset ring-primary/45" : "",
                isClickableCell && onDayClick ? "cursor-pointer hover:brightness-[0.99]" : "",
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
                  className="pointer-events-none absolute left-0 top-0 bottom-0 z-[25] w-1 rounded-r-sm bg-primary"
                  aria-hidden
                />
              )}
              <div className="relative z-[20] flex min-h-0 flex-1 flex-col">
                <div
                  className={[
                    "shrink-0 text-left text-xs font-medium tabular-nums leading-none pointer-events-none",
                    isToday ? "text-primary" : inMonth ? "text-zinc-800" : "text-zinc-400",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </div>
                <div className="min-h-0 flex-1" aria-hidden />
                {hiddenSegments.length > 0 ? (
                  <MonthDayOverflowPopover
                    day={day}
                    weekDays={week}
                    hiddenSegments={hiddenSegments}
                    onSelectEvent={onSelectEvent}
                    onDropOnDay={onDropOnDay}
                    dragLockRef={dragLockRef}
                    setDragOverKey={setDragOverKey}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
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

      if (mode === "day" || mode === "week") {
        const newAnchor = set(targetDate, {
          hours: targetDate.getHours(),
          minutes: previousAt.getMinutes(),
          seconds: previousAt.getSeconds(),
          milliseconds: previousAt.getMilliseconds(),
        });
        const deltaMs = newAnchor.getTime() - previousAt.getTime();
        if (deltaMs === 0) return;
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

      if (mode === "month" && dayKey(previousAt) === dayKey(targetDate)) return;

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
