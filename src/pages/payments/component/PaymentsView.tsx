import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import DetailItem from "@/components/ui/DetailItem";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatToCurrency } from "@/lib/helpers";
import { getLookupBadgeStyle, getPaymentStatusColor } from "@/lib/enums";
import {
  Calendar,
  Check,
  CreditCard,
  FileText,
  Info,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import type { IPayment } from "../common/payments";
import {
  useApproveOrRejectPaymentMutation,
  useLazyGetPaymentQuery,
} from "../common/paymentsApi";
import { useLazyGetAUserQuery } from "@/pages/users/common/usersApi";
import { showToast } from "@/components/ui/CustomToast";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const PaymentsView = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialData = (location.state as { initialData?: IPayment } | null)
    ?.initialData;

  const [approveOrRejectPayment] = useApproveOrRejectPaymentMutation();
  const [getPayment, { isLoading: isFetching }] = useLazyGetPaymentQuery();

  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(() =>
    initialData && initialData.id === id ? initialData : null,
  );
  const [executed, setExecuted] = useState(false);
  const [loggedByName, setLoggedByName] = useState<string>("—");
  const [approvedOrRejectedByName, setApprovedOrRejectedByName] =
    useState<string>("—");
  const [getAUser] = useLazyGetAUserQuery();

  useEffect(() => {
    if (!id) return;

    getPayment(id)
      .unwrap()
      .then((res) => {
        if (res) setSelectedPayment(res);
      })
      .catch(() => {
        if (initialData && initialData.id === id) {
          setSelectedPayment(initialData);
        }
      });
  }, [id, getPayment, initialData]);

  useEffect(() => {
    const loggedBy = selectedPayment?.loggedBy;
    if (!loggedBy) {
      setLoggedByName("—");
      return;
    }
    if (typeof loggedBy === "object") {
      const user = loggedBy as { firstName?: string; lastName?: string };
      setLoggedByName(
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—",
      );
      return;
    }
    getAUser(loggedBy as string)
      .unwrap()
      .then((user) => {
        setLoggedByName(
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—",
        );
      })
      .catch(() => setLoggedByName("—"));
  }, [selectedPayment, getAUser]);

  useEffect(() => {
    const approvedOrRejectedBy = selectedPayment?.approvedOrRejectedBy;
    if (!approvedOrRejectedBy) {
      setApprovedOrRejectedByName("—");
      return;
    }
    if (typeof approvedOrRejectedBy === "object") {
      const user = approvedOrRejectedBy as {
        firstName?: string;
        lastName?: string;
      };
      setApprovedOrRejectedByName(
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—",
      );
      return;
    }
    getAUser(approvedOrRejectedBy as string)
      .unwrap()
      .then((user) => {
        setApprovedOrRejectedByName(
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—",
        );
      })
      .catch(() => setApprovedOrRejectedByName("—"));
  }, [selectedPayment, getAUser]);

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const handleApproveOrReject = async (status: "approved" | "rejected") => {
    if (!id) return;

    try {
      await approveOrRejectPayment({ id, status }).unwrap();
      setExecuted(true);
      showToast({
        title: "Success",
        message: `Payment ${status} successfully.`,
        type: "success",
      });
      const updated = await getPayment(id).unwrap();
      if (updated) setSelectedPayment(updated);
    } catch (error) {
      console.error("Failed to update payment", error);
      showToast({
        title: "Error",
        message: `Failed to ${status} payment.`,
        type: "error",
      });
    }
  };

  if (!selectedPayment) {
    if (isFetching && !initialData) {
      return (
        <div className="relative min-h-[40vh]">
          <LoadingComponent loading />
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-muted-foreground">
        Payment not found.
      </div>
    );
  }

  const isPending = selectedPayment.status?.toLowerCase() === "pending";

  return (
    <div className="space-y-4">
      <PageTitle showBack title="Payment Details" />

      <PageSummary
        icon={CreditCard}
        title={selectedPayment.paymentCode ?? "Payment"}
        description={`Payment for ${selectedPayment.customer?.name ?? "Unknown"} - ${selectedPayment.software?.name ?? "Unknown"}`}
        actionComponent={
          isPending && (
            <div className="flex items-center gap-2 flex-wrap">
              <ConfirmationDialog
                title="Approve Payment?"
                rightActionTitle="Approve"
                content={
                  <p className="text-muted-foreground text-center">
                    Confirm that this payment has been received and verified.
                  </p>
                }
                onConfirmClicked={() => handleApproveOrReject("approved")}
                confirmButtonClassName="!bg-primary hover:!bg-primary/90 !text-primary-foreground"
                trigger={
                  <Button className="!bg-primary hover:bg-primary/90 text-white">
                    <Check className="mr-2 h-4 w-4" />
                    <span className="text-xs">Approve</span>
                  </Button>
                }
              />
              <ConfirmationDialog
                alertType="delete"
                title="Reject Payment?"
                rightActionTitle="Reject"
                content={
                  <p className="text-muted-foreground text-center">
                    This payment will be marked as rejected.
                  </p>
                }
                onConfirmClicked={() => handleApproveOrReject("rejected")}
                trigger={
                  <Button
                    variant="destructive"
                    className="!bg-red-600 hover:bg-red-800 text-white"
                  >
                    <X className="mr-2 h-4 w-4" />
                    <span className="text-xs">Reject</span>
                  </Button>
                }
              />
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">
              {selectedPayment.customer?.name ?? "—"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedPayment.customer?.email ?? "—"}
            </p>
            <div className="w-full mt-3 pt-3 border-t space-y-1 text-left">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                Company
              </p>
              <p className="text-sm text-card-foreground font-medium">
                {selectedPayment.customer?.companyName ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground uppercase font-semibold mt-2 mb-1.5">
                Phone
              </p>
              <p className="text-sm text-card-foreground font-medium">
                {selectedPayment.customer?.phone ?? "—"}
              </p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Related Software
            </h3>
            <p className="text-sm text-card-foreground font-medium">
              {selectedPayment.software?.name ?? "—"}
            </p>
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
            {selectedPayment.approvedOrRejectedBy && (
              <DetailItem
                label="Approved/Rejected By"
                value={approvedOrRejectedByName}
                icon={<User className="w-4 h-4 text-muted-foreground" />}
              />
            )}
            <DetailItem
              label="Created At"
              value={formatDate(selectedPayment.createdAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
            <DetailItem
              label="Last Updated"
              value={formatDate(selectedPayment.updatedAt)}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden space-y-0">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-card-foreground">
                Payment Details
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
                      getPaymentStatusColor(selectedPayment.status ?? "")
                        ? undefined
                        : "secondary"
                    }
                    className="capitalize border text-xs font-medium px-2 py-0 rounded-full"
                    style={getLookupBadgeStyle(
                      getPaymentStatusColor(selectedPayment.status ?? ""),
                    )}
                  >
                    {selectedPayment.status ?? "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Amount
                  </p>
                  <p className="text-sm text-card-foreground font-semibold">
                    {formatToCurrency(selectedPayment.amount ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Subscription Type
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedPayment.subscriptionType?.name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">
                    Payment Reference
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedPayment.paymentReference ?? "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="Payment Date"
                  value={formatDate(selectedPayment.paymentDate)}
                  icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                />
                <DetailItem
                  label="Renewal Date"
                  value={formatDate(selectedPayment.renewalDate)}
                  icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                />
              </div>

              {selectedPayment.notes && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <div className="p-4 bg-muted rounded-lg border border-border text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedPayment.notes}
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

export default PaymentsView;
