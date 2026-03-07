import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import DropDownComponent, {
  type DropDownOption,
} from "@/components/DropdownComponent";
import { DatePicker } from "@/components/DatePicker";
import { Separator } from "@/components/ui/separator";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Calendar, CreditCard, FileText } from "lucide-react";
import type { IPaymentFormFields } from "../common/payments";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IPaymentFormFields, object, IPaymentFormFields>;
  prefillFromSubscription?: boolean;
  prefillOptions?: {
    customerOptions?: DropDownOption<string>[];
    softwareOptions?: DropDownOption<string>[];
    subscriptionTypeOptions?: DropDownOption<string>[];
  };
}

const PaymentFormContent = ({
  isLoading,
  form,
  prefillFromSubscription = false,
  prefillOptions,
}: IField) => {
  const { control, register } = form;

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DropDownComponent
            control={control}
            name="customerId"
            label="Customer"
            title="Customer"
            options={prefillOptions?.customerOptions ?? []}
            required
            disabled={isLoading || prefillFromSubscription}
          />
          <DropDownComponent
            control={control}
            name="softwareId"
            label="Software"
            title="Software"
            options={prefillOptions?.softwareOptions ?? []}
            required
            disabled={isLoading || prefillFromSubscription}
          />
          <DropDownComponent
            control={control}
            name="subscriptionTypeId"
            label="Subscription Type"
            title="Subscription Type"
            options={prefillOptions?.subscriptionTypeOptions ?? []}
            required
            disabled={isLoading || prefillFromSubscription}
          />
          <CustomInputField<IPaymentFormFields>
            type="number"
            label="Amount"
            name="amount"
            placeholder="0.00"
            required
            disabled={isLoading}
            register={register}
          />
        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Payment Dates
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="paymentDate"
            render={({ field }) => (
              <div className="space-y-1 max-w-[200px]">
                <p className="text-xs text-onCard font-medium">
                  Payment Date <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select payment date"
                  dateOnly
                  required
                  disabled={isLoading}
                  defaultDate={
                    field.value ? new Date(field.value) : undefined
                  }
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : "")
                  }
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="renewalDate"
            render={({ field }) => (
              <div className="space-y-1 max-w-[200px]" key={field.value ?? "empty"}>
                <p className="text-xs text-onCard font-medium">
                  Renewal Date <span className="text-destructive ml-0.5">*</span>
                  {prefillFromSubscription && (
                    <span className="text-muted-foreground text-[10px] ml-1 font-normal">
                      (auto from payment date + subscription type)
                    </span>
                  )}
                </p>
                <DatePicker
                  title=""
                  placeholder={prefillFromSubscription ? "Set payment date first" : "Select renewal date"}
                  dateOnly
                  required
                  disabled={isLoading}
                  defaultDate={
                    field.value ? new Date(field.value) : undefined
                  }
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : "")
                  }
                />
              </div>
            )}
          />
        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Payment Details
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField<IPaymentFormFields>
            type="text"
            label="Payment Reference"
            name="paymentReference"
            placeholder="e.g., transaction ID, momo reference"
            required
            disabled={isLoading}
            register={register}
          />
          <CustomInputField<IPaymentFormFields>
            type="text"
            multipleLines
            label="Notes"
            name="notes"
            placeholder="e.g., Paid via momo, bank transfer"
            required
            disabled={isLoading}
            register={register}
          />
        </div>
      </CardComponent>
    </div>
  );
};

export default PaymentFormContent;
