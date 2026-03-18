import CardComponent from "@/components/CardComponent";
import DateRangeComponent, { type IDateRange } from "@/components/DateRangePicker";
import LoadingComponent from "@/components/LoadingComponent";
import PageTitle from "@/components/PageTitle";
import SearchComponent from "@/components/SearchComponent";
import ActionButton from "@/components/ActionButtons";
import { allRoutes } from "@/utils/routes";
import type { IFilters } from "@/lib/pagination";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import moment from "moment";
import { Calendar as BigCalendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IReschedule } from "../common/reschedules";
import { useLazyGetReschedulesQuery } from "../common/reschedulesApi";
import RescheduleDetailsDrawer from "./RescheduleDetailsDrawer";

const localizer = momentLocalizer(moment);

interface RescheduleEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  reschedule: IReschedule;
}

function getNewDate(res: IReschedule): Date | null {
  if (!res?.newDateTime) return null;
  const d = new Date(res.newDateTime);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inRange(d: Date, range: { start: Date; end: Date }) {
  return isWithinInterval(d, { start: range.start, end: range.end });
}

export default function ReschedulesScheduler() {
  const navigate = useNavigate();
  const [fetchQuery, fetchState] = useLazyGetReschedulesQuery();

  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month",
  );
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const today = new Date();
  const [dateRange, setDateRange] = useState<IDateRange>({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  const [filters, setFilters] = useState<IFilters | undefined>({
    startDate: startOfMonth(today).toISOString(),
    endDate: endOfMonth(today).toISOString(),
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<IReschedule | null>(null);

  const pageSize = 1000;

  const effectiveRange = useMemo(() => {
    const start = dateRange.start
      ? startOfDay(dateRange.start)
      : startOfDay(today);
    const end = dateRange.end ? endOfDay(dateRange.end) : endOfDay(today);
    return { start, end };
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    setFilters((prev) => ({
      ...(prev ?? {}),
      startDate: effectiveRange.start.toISOString(),
      endDate: effectiveRange.end.toISOString(),
    }));
  }, [effectiveRange.start, effectiveRange.end]);

  useEffect(() => {
    fetchQuery({
      pageIndex: 1,
      pageSize,
      search: searchQuery as string,
      filters,
    });
  }, [searchQuery, filters, fetchQuery]);

  const all = (fetchState.data?.contents ?? []) as IReschedule[];

  const eventsInRange = useMemo(() => {
    return all
      .map((r) => ({ r, d: getNewDate(r) }))
      .filter((x): x is { r: IReschedule; d: Date } => !!x.d)
      .filter(({ d }) => inRange(d, effectiveRange))
      .sort((a, b) => a.d.getTime() - b.d.getTime());
  }, [all, effectiveRange.start, effectiveRange.end]);

  const calendarEvents: RescheduleEvent[] = useMemo(
    () =>
      eventsInRange.map(({ r, d }) => ({
        title: r.title || r.rescheduleCode || "Reschedule",
        start: d,
        end: d,
        allDay: false,
        reschedule: r,
      })),
    [eventsInRange],
  );

  const openDetails = (r: IReschedule) => {
    setSelected(r);
    setDrawerOpen(true);
  };

  const handleNavigate = (newDate: Date) => {
    setCalendarDate(newDate);
    let start: Date;
    let end: Date;

    if (calendarView === "week") {
      start = startOfWeek(newDate, { weekStartsOn: 1 });
      end = endOfWeek(newDate, { weekStartsOn: 1 });
    } else if (calendarView === "day") {
      start = startOfDay(newDate);
      end = endOfDay(newDate);
    } else {
      start = startOfMonth(newDate);
      end = endOfMonth(newDate);
    }

    setDateRange({ start, end });
    setFilters((prev) => ({
      ...(prev ?? {}),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <PageTitle showBack title="Scheduler" subtext="Calendar view for rescheduled activities" />
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
            useText="Add Reschedule"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_RESCHEDULE)}
          />
          
        </div>
      </div>

      <CardComponent
        className="rounded-md"
        headerTitle={
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between w-full gap-2">
              <div className="flex items-center gap-4">
                <p className="text-sm font-thin flex flex-col">
                  <span className="text-[10px]">Showing</span>
                  <span className="text-lg md:text-2xl font-bold">
                    {eventsInRange.length}
                  </span>
                </p>
                <SearchComponent returnSearchKey={(k) => setSearchQuery(k)} />
              </div>
              <div className="flex items-center gap-2">
                <DateRangeComponent
                  allowFuture
                  dateOnly
                  defaultDate={dateRange}
                  dateRange={(r) => {
                    setDateRange(r);
                    setFilters((prev) => ({
                      ...(prev ?? {}),
                      startDate: r.start ? startOfDay(r.start).toISOString() : undefined,
                      endDate: r.end ? endOfDay(r.end).toISOString() : undefined,
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        }
      >
        {(fetchState.isFetching || fetchState.isLoading) && (
          <LoadingComponent loading />
        )}

        <div className="bg-card rounded-md border p-3 scheduler-calendar">
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            date={calendarDate}
            view={
              calendarView === "week"
                ? Views.WEEK
                : calendarView === "day"
                  ? Views.DAY
                  : Views.MONTH
            }
            defaultView={Views.MONTH}
            onView={(nextView) => {
              if (nextView === Views.WEEK) setCalendarView("week");
              else if (nextView === Views.DAY) setCalendarView("day");
              else setCalendarView("month");
            }}
            onNavigate={(newDate) => handleNavigate(newDate as Date)}
            onSelectEvent={(event) =>
              openDetails((event as RescheduleEvent).reschedule)
            }
            style={{ height: 600 }}
            eventPropGetter={(event: RescheduleEvent) => {
              const r = event.reschedule;
              const backgroundColor = r.colorCode || "#2563eb";
              return {
                style: {
                  backgroundColor,
                  borderRadius: "4px",
                  border: "none",
                  color: "#fff",
                  fontSize: "0.75rem",
                },
              };
            }}
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

