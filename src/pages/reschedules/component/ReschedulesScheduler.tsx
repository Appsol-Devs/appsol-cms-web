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
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns";
import "temporal-polyfill";
import { Temporal } from "temporal-polyfill";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { viewDay, viewMonthGrid, viewWeek } from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/index.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IReschedule } from "../common/reschedules";
import { useLazyGetReschedulesQuery } from "../common/reschedulesApi";
import RescheduleDetailsDrawer from "./RescheduleDetailsDrawer";

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

  const openDetails = (r: IReschedule) => {
    setSelected(r);
    setDrawerOpen(true);
  };

  const defaultColor = "#2563eb";

  const hexToOnContainer = (_hex: string) => "#000000";

  const { scheduleXEvents, scheduleXCalendars } = useMemo(() => {
    const uniqueColors = Array.from(
      new Set([
        defaultColor,
        ...eventsInRange.map(({ r }) => r.colorCode || defaultColor),
      ]),
    );

    const colorCodeToCalendarId = new Map<string, string>();
    uniqueColors.forEach((colorCode, idx) =>
      colorCodeToCalendarId.set(colorCode, `c${idx}`),
    );

    const calendars = uniqueColors.reduce<Record<string, any>>(
      (acc, colorCode, idx) => {
        const calendarId = `c${idx}`;
        const onContainer = hexToOnContainer(colorCode);
        acc[calendarId] = {
          colorName: calendarId,
          lightColors: {
            main: colorCode,
            container: colorCode,
            onContainer,
          },
          darkColors: {
            main: colorCode,
            container: colorCode,
            onContainer,
          },
        };
        return acc;
      },
      {},
    );

    const dateToZoned = (d: Date) =>
      Temporal.Instant.fromEpochMilliseconds(d.getTime()).toZonedDateTimeISO(
        "UTC",
      );

    const events = eventsInRange.map(({ r, d }, idx) => {
      const start = dateToZoned(d);
      const end = start.add({ minutes: 30 });
      const colorCode = r.colorCode || defaultColor;
      const calendarId = colorCodeToCalendarId.get(colorCode) ?? "c0";
      const eventId = r._id ?? r.rescheduleCode ?? `${calendarId}-${d.getTime()}-${idx}`;

      return {
        id: eventId,
        title: r.title || r.rescheduleCode || "Reschedule",
        start,
        end,
        calendarId,
        reschedule: r,
        _options: {
          disableDND: true,
          disableResize: true,
        },
      };
    });

    return { scheduleXEvents: events, scheduleXCalendars: calendars };
  }, [eventsInRange]);

  const selectedDate = useMemo(() => {
    const isoDate = effectiveRange.start.toISOString().slice(0, 10);
    return Temporal.PlainDate.from(isoDate);
  }, [effectiveRange.start]);

  const calendarApp = useCalendarApp({
    defaultView: viewMonthGrid.name,
    views: [viewMonthGrid, viewWeek, viewDay],
    selectedDate,
    timezone: "UTC",
    events: scheduleXEvents as any,
    calendars: scheduleXCalendars,
    callbacks: {
      onRangeUpdate: (range) => {
        const startMs = range.start.toInstant().epochMilliseconds;
        const endMs = range.end.toInstant().epochMilliseconds;
        setDateRange({
          start: new Date(startMs),
          end: new Date(endMs),
        });
      },
      onEventClick: (calendarEvent) => {
        const reschedule = (calendarEvent as any)?.reschedule as
          | IReschedule
          | undefined;
        if (reschedule) openDetails(reschedule);
      },
    },
    skipValidation: true,
  });


  useEffect(() => {
    if (!calendarApp) return;
    calendarApp.events.set(scheduleXEvents as any);
  }, [calendarApp, scheduleXEvents]);

  useEffect(() => {
    if (!calendarApp) return;

    const app = (calendarApp as any).$app;
    if (app?.config?.calendars) {
      app.config.calendars.value = scheduleXCalendars;
    }
  }, [calendarApp, scheduleXCalendars]);

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

        <div
          className="bg-card rounded-md border p-3 scheduler-calendar"
        >
          {calendarApp ? (
            <ScheduleXCalendar calendarApp={calendarApp} />
          ) : (
            <LoadingComponent loading />
          )}
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

