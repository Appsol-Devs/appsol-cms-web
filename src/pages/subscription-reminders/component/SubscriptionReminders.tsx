import ConfirmationDialog from "@/components/ConfirmationDialog";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { showToast } from "@/components/ui/CustomToast";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/helpers";
import {
  getLookupBadgeStyle,
  getReminderDeliveryBadgeStyle,
  getReminderTypeBadgeStyle,
} from "@/lib/enums";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  Hash,
  Monitor,
  Receipt,
  Send,
  Tag,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  type ISubscriptionReminder,
  formatReminderTypeLabel,
  getDueDateUrgency,
  reminderTypeFromDueDate,
} from "../common/subscription-reminder";
import {
  useLazyGetSubscriptionRemindersQuery,
  useTriggerRemindersMutation,
} from "../common/subscriptionRemindersApi";
import SubscriptionReminderDetailsDrawer from "./SubscriptionReminderDetailsDrawer";

const SubscriptionReminders = () => {
  const [fetchQuery, fetchState] = useLazyGetSubscriptionRemindersQuery();
  const [triggerReminders, { isLoading: isTriggering }] =
    useTriggerRemindersMutation();
  const [selected, setSelected] = useState<ISubscriptionReminder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const handleTriggerReminders = async () => {
    try {
      await triggerReminders().unwrap();
      setRefetch((prev) => !prev);
      showToast({
        title: "Success",
        message: "Reminders triggered successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to trigger reminders", error);
      showToast({
        title: "Error",
        message: "Failed to trigger reminders.",
        type: "error",
      });
    }
  };

  const remindersWithDerivedType = useMemo(() => {
    const rows = (fetchState.data?.contents ?? []) as ISubscriptionReminder[];
    return rows.map((r) => ({
      ...r,
      reminderType: reminderTypeFromDueDate(r.dueDate) ?? r.reminderType,
    }));
  }, [fetchState.data]);

  const columns = useMemo<ColumnDef<ISubscriptionReminder>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Reminder code",
        accessorKey: "reminderCode",
        meta: { icon: <Hash size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original.reminderCode ?? "N/A"}
          </span>
        ),
      },
      {
        header: "Title",
        accessorKey: "title",
        meta: { icon: <Tag size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs line-clamp-2 max-w-[220px]">
            {row.original.title ?? "N/A"}
          </span>
        ),
      },
      {
        header: "Customer",
        accessorKey: "customer",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => {
          const c = row.original.customer;
          const name = c?.name ?? "N/A";
          return (
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-xs">{name}</span>
            </div>
          );
        },
      },
      {
        header: "Software",
        accessorKey: "software",
        meta: { icon: <Monitor size={14} /> },
        cell: ({ row }) => {
          const sw = row.original.software;
          const name = sw?.name ?? "N/A";
          const colorCode = sw?.colorCode;
          const style = getLookupBadgeStyle(colorCode);
          return (
            <Badge
              variant={colorCode ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full max-w-[140px] truncate"
              style={style}
            >
              {name}
            </Badge>
          );
        },
      },
      {
        header: "Subscription code",
        accessorKey: "subscription",
        meta: { icon: <Receipt size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-xs">
            {row.original.subscription?.subscriptionCode ?? "N/A"}
          </span>
        ),
      },
      {
        header: "Due date",
        accessorKey: "dueDate",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => {
          const due = row.original.dueDate;
          const urgency = getDueDateUrgency(due);
          const className =
            urgency === "overdue"
              ? "font-semibold text-xs text-destructive"
              : urgency === "soon"
                ? "font-semibold text-xs text-amber-700 dark:text-amber-300"
                : "font-semibold text-xs text-muted-foreground";
          return (
            <span className={className}>
              {due ? formatDateTime(due) : "N/A"}
            </span>
          );
        },
      },
      {
        header: "Reminder type",
        accessorKey: "reminderType",
        meta: { icon: <Bell size={14} /> },
        cell: ({ row }) => {
          const t = reminderTypeFromDueDate(row.original.dueDate) ?? row.original.reminderType;
          const pillStyle = getReminderTypeBadgeStyle(t);
          return (
            <Badge
              variant={pillStyle ? undefined : "secondary"}
              className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
              style={pillStyle}
            >
              {formatReminderTypeLabel(t)}
            </Badge>
          );
        },
      },
      {
        header: "Sent",
        accessorKey: "isSent",
        meta: { icon: <Send size={14} /> },
        cell: ({ row }) => {
          const sent = Boolean(row.original.isSent);
          const pillStyle = getReminderDeliveryBadgeStyle(sent);
          return (
            <Badge
              variant={pillStyle ? undefined : "secondary"}
              className="border text-xs font-medium px-2 py-0 rounded-full capitalize"
              style={pillStyle}
            >
              {sent ? "Sent" : "Not sent"}
            </Badge>
          );
        },
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        meta: { icon: <Calendar size={14} /> },
        cell: ({ row }) => (
          <span className="font-semibold text-muted-foreground text-xs">
            {row.original.createdAt
              ? formatDateTime(row.original.createdAt)
              : "N/A"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <FeatureContentRenderer
        refetchData={refetch}
        tableAddComponent={() => (
          <ConfirmationDialog
            title="Trigger reminders?"
            rightActionTitle="Trigger"
            content={
              <p className="text-muted-foreground text-center">
                This will manually send subscription reminders for all due
                items.
              </p>
            }
            onConfirmClicked={handleTriggerReminders}
            confirmButtonClassName="!bg-primary hover:!bg-primary/90 !text-primary-foreground"
            trigger={
              <Button
                disabled={isTriggering}
                className="!bg-primary hover:bg-primary/90 text-white"
              >
                <Send className="mr-2 h-4 w-4" />
                <span className="text-xs">
                  {isTriggering ? "Triggering..." : "Trigger reminders"}
                </span>
              </Button>
            }
          />
        )}
        useDateFilters
        dateFilterNoDefault
        filters={[
          "customerId",
          "softwareId",
          "reminderType",
          "isSent",
        ]}
        pathOnRowSelected={(data) => {
          setSelected(data);
          setDrawerOpen(true);
        }}
        columns={columns}
        title="Subscription reminders"
        lazyFetchQuery={[fetchQuery, fetchState]}
        data={remindersWithDerivedType}
      />
      <SubscriptionReminderDetailsDrawer
        reminder={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
};

export default SubscriptionReminders;
