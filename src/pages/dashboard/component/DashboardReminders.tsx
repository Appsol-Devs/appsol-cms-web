import CardComponent from "@/components/CardComponent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getReminderDueUrgencyBadgeStyle,
  getReminderDueUrgencyLabel,
} from "@/lib/enums";
import { formatDateTime } from "@/lib/helpers";
import { allRoutes } from "@/utils/routes";
import { Building2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetSubscriptionRemindersQuery,
} from "@/pages/subscription-reminders/common/subscriptionRemindersApi";
import type { ISubscriptionReminder } from "@/pages/subscription-reminders/common/subscription-reminder";
import {
  getDueDateTab,
  getDueDateUrgency,
} from "@/pages/subscription-reminders/common/subscription-reminder";
import SubscriptionReminderDetailsDrawer from "@/pages/subscription-reminders/component/SubscriptionReminderDetailsDrawer";
import { Badge } from "@/components/ui/badge";

const CARD_CLASS = "w-full min-w-[280px]";
const LIST_LIMIT = 6;
const TAB_BUTTON_BASE =
  "text-xs h-8 rounded-sm border-0 shadow-none transition-colors focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0";

type TabKey = "all" | "overdue" | "due_today" | "upcoming";

function filterByTab(
  items: ISubscriptionReminder[],
  tab: TabKey,
): ISubscriptionReminder[] {
  if (tab === "all") return items;
  return items.filter((r) => getDueDateTab(r.dueDate) === tab);
}

const DashboardReminders = () => {
  const [tab, setTab] = useState<TabKey>("all");
  const [selected, setSelected] = useState<ISubscriptionReminder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError } = useGetSubscriptionRemindersQuery({
    pageSize: 100,
    pageIndex: 1,
  });

  const reminders = (data?.contents ?? []) as ISubscriptionReminder[];

  const counts = useMemo(() => {
    const all = reminders.length;
    const overdue = reminders.filter(
      (r) => getDueDateTab(r.dueDate) === "overdue",
    ).length;
    const dueToday = reminders.filter(
      (r) => getDueDateTab(r.dueDate) === "due_today",
    ).length;
    const upcoming = reminders.filter(
      (r) => getDueDateTab(r.dueDate) === "upcoming",
    ).length;
    return { all, overdue, dueToday, upcoming };
  }, [reminders]);

  const filtered = useMemo(() => {
    return filterByTab(reminders, tab).slice(0, LIST_LIMIT);
  }, [reminders, tab]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className="font-bold">Reminders</p>
      <Button variant="link" className="h-auto p-0 text-xs font-medium !text-primary" asChild>
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
    { key: "overdue", label: "Overdue", count: counts.overdue },
    { key: "due_today", label: "Due Today", count: counts.dueToday },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
  ];

  return (
    <>
      <CardComponent className={CARD_CLASS} headerTitle={header}>
        <div className="space-y-0">
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant="ghost"
                size="sm"
                className={cn(
                  TAB_BUTTON_BASE,
                  tab !== t.key &&
                    "!bg-transparent text-foreground hover:bg-muted/60 hover:text-foreground",
                  tab === t.key &&
                    "!bg-primary !text-primary-foreground hover:!bg-primary/90 hover:!text-primary-foreground",
                )}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.key !== "all" && (
                  <span
                    className={cn(
                      "ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0 text-[10px] font-medium",
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

          <div className="pt-3">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No reminders in this category.
              </p>
            ) : (
              <div className="divide-y !divide-border">
                {filtered.map((r) => {
                  const urgency = getDueDateUrgency(r.dueDate);
                  const pillStyle = getReminderDueUrgencyBadgeStyle(urgency);
                  const customerName =
                    r.customer?.name ?? r.customer?.companyName ?? "—";
                  const softwareName = r.software?.name ?? "—";
                  return (
                    <button
                      key={r._id}
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
                          {r.title ?? "—"}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                          <Badge
                            variant={pillStyle ? undefined : "secondary"}
                            className="border text-[10px] font-medium px-1.5 py-0 rounded-full"
                            style={pillStyle}
                          >
                            {getReminderDueUrgencyLabel(urgency)}
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
