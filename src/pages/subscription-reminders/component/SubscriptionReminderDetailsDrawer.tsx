import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/helpers";
import {
  getLookupBadgeStyle,
  getReminderDeliveryBadgeStyle,
  getReminderDueUrgencyBadgeStyle,
  getReminderDueUrgencyLabel,
  getReminderTypeBadgeStyle,
  getSubscriptionAutoRenewBadgeStyle,
  getSubscriptionStatusColor,
} from "@/lib/enums";
import { allRoutes } from "@/utils/routes";
import {
  Bell,
  Calendar,
  CreditCard,
  Mail,
  MessageSquare,
  Monitor,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  type ISubscriptionReminder,
  formatReminderTypeLabel,
  formatReminderTitle,
  getDueDateUrgency,
} from "../common/subscription-reminder";

export interface SubscriptionReminderDetailsDrawerProps {
  reminder: ISubscriptionReminder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function sentViaIcon(sentVia?: string) {
  if (sentVia === "sms") return <MessageSquare className="w-4 h-4" />;
  if (sentVia === "notification") return <Bell className="w-4 h-4" />;
  return <Mail className="w-4 h-4" />;
}

export default function SubscriptionReminderDetailsDrawer({
  reminder,
  open,
  onOpenChange,
}: SubscriptionReminderDetailsDrawerProps) {
  const navigate = useNavigate();

  const customer = reminder?.customer;
  const customerName = customer?.name ?? "N/A";
  const software = reminder?.software;
  const softwareName = software?.name ?? "N/A";
  const sub = reminder?.subscription;
  const urgency = getDueDateUrgency(reminder?.dueDate);
  const dueUrgencyStyle = getReminderDueUrgencyBadgeStyle(urgency);
  const reminderTypeStyle = getReminderTypeBadgeStyle(reminder?.reminderType);
  const sentStyle = reminder
    ? getReminderDeliveryBadgeStyle(Boolean(reminder.isSent))
    : undefined;
  const autoRenewStyle = getSubscriptionAutoRenewBadgeStyle(sub?.autoRenew);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[calc(100vh-2rem)] sm:max-w-lg !top-4 !right-4 !bottom-4 data-[vaul-drawer-direction=right]:!top-4 data-[vaul-drawer-direction=right]:!right-4 data-[vaul-drawer-direction=right]:!bottom-4 data-[vaul-drawer-direction=right]:rounded-xl flex flex-col overflow-hidden">
        <DrawerHeader className="shrink-0 flex flex-row items-center justify-between gap-3 border-b py-4">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground shrink-0" />
            <DrawerTitle className="text-left line-clamp-2">
              Subscription reminder
            </DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 bg-transparent! border-none! hover:bg-transparent! hover:text-muted-foreground!"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {reminder ? (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="shrink-0 px-4 py-3 space-y-3 border-b">
              <p className="font-semibold text-foreground text-sm leading-snug">
                {formatReminderTitle(reminder.title)}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground font-medium">
                  {reminder.reminderCode ?? "—"}
                </span>
                <Badge
                  variant={reminderTypeStyle ? undefined : "secondary"}
                  className="border text-xs capitalize font-medium px-2 py-0 rounded-full"
                  style={reminderTypeStyle}
                >
                  {formatReminderTypeLabel(reminder.reminderType)}
                </Badge>
                <Badge
                  variant={sentStyle ? undefined : "secondary"}
                  className="border text-xs font-medium px-2 py-0 rounded-full capitalize"
                  style={sentStyle}
                >
                  {reminder.isSent ? "Sent" : "Not sent"}
                </Badge>
                {reminder.sentVia && (
                  <Badge variant="outline" className="text-xs gap-1">
                    {sentViaIcon(reminder.sentVia)}
                    {reminder.sentVia}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 overscroll-contain">
              <div className="space-y-6 pb-6">
                <section className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Customer
                  </h4>
                  <div className="rounded-lg border bg-card/50 p-3 text-sm space-y-1">
                    <p className="font-medium">{customerName}</p>
                    {customer?.companyName && (
                      <p className="text-xs text-muted-foreground">
                        {customer.companyName}
                      </p>
                    )}
                    {customer?.email && (
                      <p className="text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    )}
                    {customer?.phone && (
                      <p className="text-xs text-muted-foreground">
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    Software
                  </h4>
                  <div className="rounded-lg border bg-card/50 p-3">
                    <Badge
                      variant={software?.colorCode ? undefined : "secondary"}
                      className="capitalize text-xs font-medium px-2 py-0.5 rounded-full"
                      style={getLookupBadgeStyle(software?.colorCode)}
                    >
                      {softwareName}
                    </Badge>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Subscription
                  </h4>
                  <div className="rounded-lg border bg-card/50 p-3 text-sm space-y-2">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <span className="font-mono text-xs">
                        {sub?.subscriptionCode ?? "—"}
                      </span>
                      {sub?.status && (
                        <Badge
                          variant={
                            getSubscriptionStatusColor(sub.status)
                              ? undefined
                              : "outline"
                          }
                          className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                          style={getLookupBadgeStyle(
                            getSubscriptionStatusColor(sub.status),
                          )}
                        >
                          {sub.status}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">
                          {sub?.amount != null
                            ? `${sub.amount.toLocaleString()}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 items-start">
                        <span className="text-muted-foreground shrink-0">
                          Next billing
                        </span>
                        <span className="font-medium text-right">
                          {sub?.nextBillingDate
                            ? formatDateTime(sub.nextBillingDate)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 items-center pt-1 border-t border-border/60">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Auto-renew
                        </span>
                        <Badge
                          variant={autoRenewStyle ? undefined : "secondary"}
                          className="border text-xs font-medium px-2 py-0 rounded-full"
                          style={autoRenewStyle}
                        >
                          {sub?.autoRenew ? "Auto-renew" : "Manual"}
                        </Badge>
                      </div>
                    </div>
                    {sub?._id && (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs !bg-primary !text-primary-foreground"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(
                            allRoutes.PORTAL +
                              allRoutes.VIEW_SUBSCRIPTION(sub._id as string),
                          );
                        }}
                      >
                        View subscription
                      </Button>
                    )}
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Reminder
                  </h4>
                  <div className="rounded-lg border bg-card/50 p-3 text-sm space-y-2">
                    <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-muted-foreground self-start sm:self-center">
                        Due date
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={dueUrgencyStyle ? undefined : "secondary"}
                          className="border text-xs font-medium px-2 py-0 rounded-full capitalize"
                          style={dueUrgencyStyle}
                        >
                          {getReminderDueUrgencyLabel(urgency)}
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {reminder.dueDate
                            ? formatDateTime(reminder.dueDate)
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Created</span>
                      <span>
                        {reminder.createdAt
                          ? formatDateTime(reminder.createdAt)
                          : "—"}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            No reminder selected.
          </p>
        )}
      </DrawerContent>
    </Drawer>
  );
}
