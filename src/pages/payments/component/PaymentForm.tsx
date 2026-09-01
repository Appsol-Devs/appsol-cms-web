import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import type { DropDownOption } from "@/components/DropdownComponent";
import { addMonths } from "date-fns";
import { CreditCard, Calendar, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { IPaymentFormFields } from "../common/payments";
import { useCreatePaymentMutation } from "../common/paymentsApi";
import { useLazyGetASubscriptionQuery } from "@/pages/subscriptions/common/subscriptionsApi";
import type { ISubscription } from "@/pages/subscriptions/common/subscriptions";
import PaymentFormContent from "./PaymentFormContent";

const PaymentForm = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();
  const [getSubscription, { isLoading: isGetting }] =
    useLazyGetASubscriptionQuery();

  const form = useForm<IPaymentFormFields>({
    defaultValues: {},
  });
  const { watch, getValues, reset, setValue } = form;
  const values = watch();
  const paymentDate = watch("paymentDate");

  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [prefillOptions, setPrefillOptions] = useState<{
    customerOptions: DropDownOption<string>[];
    softwareOptions: DropDownOption<string>[];
    subscriptionTypeOptions: DropDownOption<string>[];
  }>({
    customerOptions: [],
    softwareOptions: [],
    subscriptionTypeOptions: [],
  });

  useEffect(() => {
    if (!subscriptionId) return;

    getSubscription(subscriptionId)
      .unwrap()
      .then((res) => {
        if (res) {
          setSubscription(res);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch subscription", err);
        showToast({
          title: "Error",
          message: "Failed to load subscription details.",
          type: "error",
        });
      });
  }, [subscriptionId, getSubscription]);

  useEffect(() => {
    if (!subscription) return;

    const customer = subscription.customer;
    const software = subscription.software;
    const subscriptionType = subscription.subscriptionType;

    const opts = {
      customerOptions: customer?.id
        ? [{ label: customer.name ?? "", value: customer.id }]
        : [],
      softwareOptions: software?.id
        ? [{ label: software.name ?? "", value: software.id }]
        : [],
      subscriptionTypeOptions: subscriptionType?.id
        ? [{ label: subscriptionType.name ?? "", value: subscriptionType.id }]
        : [],
    };
    setPrefillOptions(opts);

    reset({
      customerId: opts.customerOptions[0],
      softwareId: opts.softwareOptions[0],
      subscriptionTypeId: opts.subscriptionTypeOptions[0],
      amount: subscription.amount ?? 0,
      paymentDate: "",
      renewalDate: "",
      notes: "",
      paymentReference: "",
    });
  }, [subscription, reset]);

  useEffect(() => {
    if (!paymentDate || !subscription?.subscriptionType?.durationInMonths)
      return;
    const durationInMonths =
      subscription.subscriptionType.durationInMonths ?? 1;
    const start = new Date(paymentDate);
    const renewal = addMonths(start, durationInMonths);
    setValue("renewalDate", renewal.toISOString());
  }, [paymentDate, subscription?.subscriptionType?.durationInMonths, setValue]);

  const submitData = () => {
    const data = getValues();

    const requiredFields: { field: unknown; message: string }[] = [
      { field: data.customerId?.value, message: "Customer is required." },
      { field: data.softwareId?.value, message: "Software is required." },
      {
        field: data.subscriptionTypeId?.value,
        message: "Subscription type is required.",
      },
      {
        field: data.amount !== undefined && data.amount !== null,
        message: "Amount is required.",
      },
      { field: data.paymentDate, message: "Payment date is required." },
      { field: data.renewalDate, message: "Renewal date is required." },
      { field: data.notes?.trim(), message: "Notes are required." },
      {
        field: data.paymentReference?.trim(),
        message: "Payment reference is required.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({
          title: "Validation",
          message,
          type: "info",
          duration: 2000,
        });
        return;
      }
    }

    if (Number(data.amount ?? 0) < 0) {
      showToast({
        title: "Validation",
        message: "Amount must be 0 or greater.",
        type: "info",
        duration: 2000,
      });
      return;
    }

    createPayment({
      customerId: data.customerId!.value,
      subscriptionTypeId: data.subscriptionTypeId!.value,
      softwareId: data.softwareId?.value,
      paymentDate: data.paymentDate!,
      renewalDate: data.renewalDate!,
      amount: Number(data.amount ?? 0),
      notes: data.notes!,
      paymentReference: data.paymentReference!,
    })
      .unwrap()
      .then(() => {
        showToast({
          title: "Success",
          message:
            "Payment initialized successfully. Status is pending until approved.",
          type: "success",
        });
        navigate(-1);
      })
      .catch((err) => {
        if (!err) return;
        showToast({
          title: "Error",
          message: err?.data?.message ?? "Failed to create payment.",
          type: "error",
        });
      });
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Payment Information",
      icon: <CreditCard className="w-4 h-4" />,
      data: [
        {
          label: "Customer",
          value: values?.customerId?.label as string,
          required: true,
        },
        {
          label: "Software",
          value: values?.softwareId?.label as string,
          required: true,
        },
        {
          label: "Subscription Type",
          value: values?.subscriptionTypeId?.label as string,
          required: true,
        },
        {
          label: "Amount",
          value: values?.amount?.toString() ?? "",
          required: true,
        },
      ],
    },
    {
      title: "Dates",
      icon: <Calendar className="w-4 h-4" />,
      data: [
        {
          label: "Payment Date",
          value: values?.paymentDate
            ? new Date(values.paymentDate).toLocaleDateString()
            : "",
          required: true,
        },
        {
          label: "Renewal Date",
          value: values?.renewalDate
            ? new Date(values.renewalDate).toLocaleDateString()
            : "",
          required: true,
        },
      ],
    },
    {
      title: "Details",
      icon: <FileText className="w-4 h-4" />,
      data: [
        {
          label: "Payment Reference",
          value: values?.paymentReference ?? "",
          required: true,
        },
        { label: "Notes", value: values?.notes ?? "", required: true },
      ],
    },
  ];

  const isLoading = isGetting || isCreating;

  if (!subscriptionId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Invalid subscription. Please go back and try again.
      </div>
    );
  }

  return (
    <div>
      <MutationFormTemplate<IPaymentFormFields>
        form={form}
        pageSummary={{
          title: "Initialize Payment",
          description: "Enter payment details. ",
          icon: CreditCard,
        }}
        formContent={
          <PaymentFormContent
            form={form}
            isLoading={isLoading}
            prefillFromSubscription={!!subscription}
            prefillOptions={subscription ? prefillOptions : undefined}
          />
        }
        submitData={submitData}
        pageTitle="Make Payment"
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Payment Summary",
          summarySaveButtonText: "Submit Payment",
        }}
      />
    </div>
  );
};

export default PaymentForm;
