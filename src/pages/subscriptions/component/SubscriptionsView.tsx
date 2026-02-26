import ActionButton from "@/components/ActionButtons";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import DetailItem from "@/components/ui/DetailItem";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/CustomToast";
import { formatDate, formatToCurrency } from "@/lib/helpers";
import { allRoutes } from "@/utils/routes";
import { Calendar, Info, Receipt, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ISubscription } from "../common/subscriptions";
import {
  useDeleteSubscriptionMutation,
  useLazyGetASubscriptionQuery,
} from "../common/subscriptionsApi";
import { useLazyGetAUserQuery } from "@/pages/users/common/usersApi";
import { Badge } from "@/components/ui/badge";
import {
  getLookupBadgeStyle,
  getSubscriptionStatusColor,
} from "@/lib/enums";

const SubscriptionsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = (location.state as { initialData?: ISubscription } | null)?.initialData;

  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [getSubscriptionDetails, { isLoading: isFetching }] =
    useLazyGetASubscriptionQuery();

  const [selectedSubscription, setSelectedSubscription] =
    useState<ISubscription | null>(() =>
      initialData && initialData._id === id ? initialData : null
    );
  const [loggedByName, setLoggedByName] = useState<string>("—");
  const [getAUser] = useLazyGetAUserQuery();

  useEffect(() => {
    if (!id) return;

    getSubscriptionDetails(id)
      .unwrap()
      .then((res) => {
        if (res) {
          setSelectedSubscription(res);
        }
      })
      .catch((err) =>
        console.error("Failed to fetch subscription details", err)
      );
  }, [id, getSubscriptionDetails]);

  useEffect(() => {
    const loggedBy = selectedSubscription?.loggedBy;
    if (!loggedBy) {
      setLoggedByName("—");
      return;
    }
    if (typeof loggedBy === "object") {
      const user = loggedBy as { firstName?: string; lastName?: string };
      setLoggedByName(
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"
      );
      return;
    }
    getAUser(loggedBy as string)
      .unwrap()
      .then((user) => {
        setLoggedByName(
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"
        );
      })
      .catch(() => setLoggedByName("—"));
  }, [selectedSubscription, getAUser]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteSubscription({ id }).unwrap();
      showToast({
        title: "Success",
        message: "Subscription deleted successfully.",
        type: "success",
      });
      navigate(allRoutes.PORTAL + allRoutes.SUBSCRIPTIONS);
    } catch (error) {
      console.error("Failed to delete subscription", error);
      showToast({
        title: "Error",
        message: "Failed to delete subscription.",
        type: "error",
      });
    }
  };

  if (!selectedSubscription) {
    if (isFetching) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Subscription not found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Subscription Details" />

      <PageSummary
        icon={Receipt}
        title={selectedSubscription.subscriptionCode ?? "Subscription"}
        description={`Subscription for ${
          selectedSubscription.customer?.name ?? "Unknown customer"
        } - ${selectedSubscription.software?.name ?? "Unknown software"}`}
        actionComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton
              onClick={() =>
                navigate(
                  allRoutes.PORTAL + allRoutes.UPDATE_SUBSCRIPTION(id as string)
                )
              }
              type="edit"
              useText="Edit"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Subscription?"
              rightActionTitle="Delete"
              content={
                <p className="text-muted-foreground text-center">
                  This action cannot be undone. This will permanently delete the
                  subscription{" "}
                  <strong>
                    {selectedSubscription.subscriptionCode ??
                      selectedSubscription.customer?.name}
                  </strong>
                  .
                </p>
              }
              onConfirmClicked={handleDelete}
              trigger={
                <Button
                  variant="destructive"
                  className="bg-red-700! text-white hover:bg-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="text-xs">Delete</span>
                </Button>
              }
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">
              {selectedSubscription.customer?.name ?? "—"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedSubscription.customer?.email ?? "—"}
            </p>
            <div className="w-full mt-3 pt-3 border-t space-y-1 text-left">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                Company
              </p>
              <p className="text-sm text-card-foreground font-medium">
                {selectedSubscription.customer?.companyName ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground uppercase font-semibold mt-2 mb-1.5">
                Phone
              </p>
              <p className="text-sm text-card-foreground font-medium">
                {selectedSubscription.customer?.phone ?? "—"}
              </p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Software
            </h3>
            <Badge
              variant={
                selectedSubscription.software?.colorCode
                  ? undefined
                  : "secondary"
              }
              className="capitalize border text-xs font-medium px-2 py-1 rounded-full"
              style={getLookupBadgeStyle(
                selectedSubscription.software?.colorCode
              )}
            >
              {selectedSubscription.software?.name ?? "—"}
            </Badge>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              System Info
            </h3>
            <DetailItem
              label="Logged By"
              value={loggedByName}
              icon={<User className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Created At"
              value={formatDate(selectedSubscription.createdAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Last Updated"
              value={formatDate(selectedSubscription.updatedAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden space-y-0">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-card-foreground">
                Subscription Details
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Status
                  </p>
                  <Badge
                    variant={
                      getSubscriptionStatusColor(
                        selectedSubscription.status ?? ""
                      )
                        ? undefined
                        : "secondary"
                    }
                    className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                    style={getLookupBadgeStyle(
                      getSubscriptionStatusColor(
                        selectedSubscription.status ?? ""
                      )
                    )}
                  >
                    {selectedSubscription.status ?? "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Amount
                  </p>
                  <p className="text-sm text-card-foreground font-semibold">
                    {formatToCurrency(selectedSubscription.amount ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Auto Renew
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedSubscription.autoRenew ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Subscription Type
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedSubscription.subscriptionType?.name ??
                      selectedSubscription.lastPayment?.subscriptionType?.name ??
                      "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="Start Date"
                  value={formatDate(selectedSubscription.startDate)}
                  icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                />
                <DetailItem
                  label="Current Period Start"
                  value={formatDate(selectedSubscription.currentPeriodStart)}
                  icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                />
                <DetailItem
                  label="Current Period End"
                  value={formatDate(selectedSubscription.currentPeriodEnd)}
                  icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                />
                <DetailItem
                  label="Next Billing Date"
                  value={formatDate(selectedSubscription.nextBillingDate)}
                  icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                />
              </div>

              {selectedSubscription.notes && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">
                    Notes
                  </label>
                  <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedSubscription.notes}
                  </div>
                </div>
              )}

              {selectedSubscription.lastPayment && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                    Last Payment
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-1">
                    <p>
                      <span className="font-medium">Amount:</span>{" "}
                      {formatToCurrency(
                        selectedSubscription.lastPayment.amount ?? 0
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(selectedSubscription.lastPayment.paymentDate)}
                    </p>
                    <p>
                      <span className="font-medium">Payment Code:</span>{" "}
                      {selectedSubscription.lastPayment.paymentCode ?? "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsView;
