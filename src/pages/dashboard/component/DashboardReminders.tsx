import CardComponent from "@/components/CardComponent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getReminderTypeBadgeStyle } from "@/lib/enums";
import { formatDateTime } from "@/lib/helpers";
import { allRoutes } from "@/utils/routes";
import { Building2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGetSubscriptionRemindersQuery } from "@/pages/subscription-reminders/common/subscriptionRemindersApi";
import {
  type ISubscriptionReminder,
  type TSubscriptionReminderType,
  formatReminderTypeLabel,
  formatReminderTitle,
  reminderTypeFromDueDate,
} from "@/pages/subscription-reminders/common/subscription-reminder";
import SubscriptionReminderDetailsDrawer from "@/pages/subscription-reminders/component/SubscriptionReminderDetailsDrawer";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_PRESET_BUTTON_CLASS } from "../common/dashboard";

const CARD_CLASS = "w-full min-w-0 max-w-full overflow-x-hidden";
const REMINDERS_FETCH_SIZE = 100;
const REMINDERS_LIST_MAX_HEIGHT = "max-h-[calc(3*5.75rem)]";

const REMINDER_TYPE_TABS: TSubscriptionReminderType[] = [
  "due_today",
  "7_days",
  "14_days",
  "30_days",
  "overdue",
];

type TabKey = "all" | TSubscriptionReminderType;

function dueDateSortKey(dueDate?: string): number {
  if (!dueDate) return Number.NEGATIVE_INFINITY;
  const t = new Date(dueDate).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

function sortRemindersByDueDateNewestFirst(
  items: ISubscriptionReminder[],
): ISubscriptionReminder[] {
  return [...items].sort(
    (a, b) => dueDateSortKey(b.dueDate) - dueDateSortKey(a.dueDate),
  );
}

function filterByTab(
  items: ISubscriptionReminder[],
  tab: TabKey,
): ISubscriptionReminder[] {
  if (tab === "all") return items;
  return items.filter(
    (r) => (reminderTypeFromDueDate(r.dueDate) ?? r.reminderType) === tab,
  );
}

const DashboardReminders = () => {
  const [tab, setTab] = useState<TabKey>("all");
  const [selected, setSelected] = useState<ISubscriptionReminder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: allData,
    isLoading,
    isError,
  } = useGetSubscriptionRemindersQuery({
    pageSize: REMINDERS_FETCH_SIZE,
    pageIndex: 1,
  });

  const allRemindersWithType = useMemo(() => {
    const reminders = (allData?.contents ?? []) as ISubscriptionReminder[];
    return reminders.map((r) => ({
      ...r,
      reminderType: reminderTypeFromDueDate(r.dueDate) ?? r.reminderType,
    }));
  }, [allData?.contents]);

  const counts = useMemo(() => {
    const byType = (type: TSubscriptionReminderType) =>
      allRemindersWithType.filter((r) => r.reminderType === type).length;
    return {
      all: allRemindersWithType.length,
      "30_days": byType("30_days"),
      "14_days": byType("14_days"),
      "7_days": byType("7_days"),
      due_today: byType("due_today"),
      overdue: byType("overdue"),
    };
  }, [allRemindersWithType]);

  const filtered = useMemo(() => {
    const inTab = filterByTab(allRemindersWithType, tab);
    return sortRemindersByDueDateNewestFirst(inTab);
  }, [allRemindersWithType, tab]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className="font-bold">Reminders</p>
      <Button
        variant="link"
        className="h-auto p-0 text-xs font-medium !text-primary"
        asChild
      >
        <Link to={allRoutes.PORTAL + allRoutes.SUBSCRIPTION_REMINDERS}>
          View all
        </Link>
      </Button>
    </div>
  );

  if (isLoading || isError) {
    const msg = isLoading
      ? "Loading reminders..."
      : "Failed to load reminders.";
    return (
      <CardComponent className={CARD_CLASS} headerTitle={header}>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          {msg}
        </div>
      </CardComponent>
    );
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    ...REMINDER_TYPE_TABS.map((key) => ({
      key,
      label: formatReminderTypeLabel(key),
      count: counts[key],
    })),
  ];

  return (
    <>
      <CardComponent className={CARD_CLASS} headerTitle={header}>
        <div className="space-y-0">
          <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto hide-scrollbar border-b border-border pb-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant="ghost"
                size="sm"
                className={cn(
                  DASHBOARD_PRESET_BUTTON_CLASS,
                  "shrink-0",
                  "focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                  tab !== t.key &&
                    "!bg-transparent !text-black dark:!text-foreground",
                  tab === t.key && "!bg-primary !text-onPrimary",
                )}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.key !== "all" && (
                  <span
                    className={cn(
                      "ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0 text-xs font-medium",
                      tab === t.key && "bg-primary-foreground/20 text-inherit",
                      tab !== t.key &&
                        (t.key === "overdue" && t.count > 0
                          ? "bg-destructive/15 text-destructive"
                          : "bg-muted/60 text-muted-foreground"),
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </Button>
            ))}
          </div>

          <div
            className={cn(
              "pt-3 overflow-y-auto overscroll-contain hide-scrollbar",
              REMINDERS_LIST_MAX_HEIGHT,
            )}
          >
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No reminders in this category.
              </p>
            ) : (
              <div className="divide-y !divide-border">
                {filtered.map((r) => {
                  const pillStyle = getReminderTypeBadgeStyle(r.reminderType);
                  const customerName =
                    r.customer?.name ?? r.customer?.companyName ?? "—";
                  const softwareName = r.software?.name ?? "—";
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className="flex w-full items-start gap-2 py-3 text-left transition-colors !bg-card hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-0"
                      onClick={() => {
                        setSelected(r);
                        setDrawerOpen(true);
                      }}
                    >
                      <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border !border-muted-foreground !bg-card" />
                      <div className="min-w-0 flex-1 space-y-1 !bg-card">
                        <p className="font-semibold text-sm leading-tight line-clamp-2">
                          {formatReminderTitle(r.title)}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                          <Badge
                            variant={pillStyle ? undefined : "secondary"}
                            className="border text-[10px] font-medium px-1.5 py-0 rounded-full"
                            style={pillStyle}
                          >
                            {formatReminderTypeLabel(r.reminderType)}
                          </Badge>
                          <span className="text-muted-foreground">
                            {r.dueDate ? formatDateTime(r.dueDate) : "—"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {softwareName}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardComponent>

      <SubscriptionReminderDetailsDrawer
        reminder={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
};

export default DashboardReminders;
