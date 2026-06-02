import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/DatePicker";
import { Controller, type UseFormReturn } from "react-hook-form";
import { CalendarClock, ClipboardList } from "lucide-react";
import DropDownComponent, { type DropDownOption } from "@/components/DropdownComponent";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import { PAYMENT_STATUS_ENUM } from "@/lib/enums";
import { useCallback } from "react";
import { lookup_params } from "@/lib/api";
import type { ICustomer } from "@/pages/customer/common/customers";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import type { IRescheduleFormFields, TargetEntityType } from "../common/reschedules";
import { parseRescheduleDate } from "../common/reschedules";
import { getTargetEntityTypeColor } from "@/lib/enums";

const toDatePickerDefault = (iso?: string) => {
  const d = parseRescheduleDate(iso);
  return d ?? undefined;
};

interface Props {
  isLoading?: boolean;
  form: UseFormReturn<IRescheduleFormFields, object, IRescheduleFormFields>;
}

export const TARGET_ENTITY_TYPE_OPTIONS: DropDownOption<TargetEntityType>[] = [
  { label: "Customer Setup", value: "CustomerSetup" },
  { label: "Generic", value: "Generic" },
  { label: "Ticket", value: "Ticket" },
  { label: "Customer Outreach", value: "CustomerOutreach" },
  { label: "Customer Complaint", value: "CustomerComplaint" },
  { label: "Subscription Reminder", value: "SubscriptionReminder" },
];

const RescheduleFormContent = ({ isLoading, form }: Props) => {
  const { control, register } = form;
  const [getCustomers] = useLazyGetCustomersQuery();
  const statusOptions = useGenerateDropdownOptionsFromEnum(PAYMENT_STATUS_ENUM);

  const loadCustomerOptions = useCallback(
    async (inputValue: string): Promise<DropDownOption<ICustomer>[]> => {
      const res = await getCustomers({
        ...lookup_params,
        search: inputValue || undefined,
      }).unwrap();
      if (!res?.contents) return [];
      return (res.contents as ICustomer[]).map((item) => ({
        label: `${item.name || ""}${
          item.companyName ? " - " + item.companyName : ""
        }`,
        value: item,
      }));
    },
    [getCustomers],
  );

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Schedule Details
              </p>
              <p className="text-xs text-rx-secondary">
                Required <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField<IRescheduleFormFields>
            type="text"
            label="Title"
            name="title"
            placeholder="e.g. Call ASN Drinks and More"
            required
            disabled={isLoading}
            register={register}
          />

          <AsyncDropDownComponent<ICustomer>
            control={control}
            name="customerId"
            placeholder="Search customers..."
            label="Customer"
            required
            disabled={isLoading}
            options={loadCustomerOptions}
            width="100%"
            formatOptionLabel={(option) => (
              <p className="font-semibold text-xs">
                {option.value?.name ?? "—"}
                {option.value?.companyName ? ` — ${option.value.companyName}` : ""}
              </p>
            )}
          />

          <DropDownComponent<TargetEntityType>
            control={control}
            name="targetEntityType"
            title="Target Entity Type"
            label="Select entity type"
            required
            options={TARGET_ENTITY_TYPE_OPTIONS}
            disabled={isLoading}
            formatOptionLabel={(option) => (
              <span className="inline-flex items-center gap-2 font-semibold text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-1 ring-zinc-300/80"
                  style={{
                    backgroundColor:
                      getTargetEntityTypeColor(String(option.value)) ?? "#64748b",
                  }}
                />
                {option.label}
              </span>
            )}
          />

          <Controller
            control={control}
            name="originalDateTime"
            render={({ field }) => (
              <div className="space-y-1 max-w-[280px]">
                <p className="text-xs text-onCard font-medium">
                  Original Date & Time{" "}
                  <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select original date and time"
                  required
                  disabled={isLoading}
                  defaultDate={toDatePickerDefault(field.value)}
                  onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="newDateTime"
            render={({ field }) => (
              <div className="space-y-1 max-w-[280px]">
                <p className="text-xs text-onCard font-medium">
                  New Date & Time <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select new date and time"
                  required
                  disabled={isLoading}
                  defaultDate={toDatePickerDefault(field.value)}
                  onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="from"
            render={({ field }) => (
              <div className="space-y-1 max-w-[280px]">
                <p className="text-xs text-onCard font-medium">
                  From <span className="text-destructive ml-0.5">*</span>
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  Start of the scheduled range
                </p>
                <DatePicker
                  title=""
                  placeholder="Range start date and time"
                  required
                  disabled={isLoading}
                  defaultDate={toDatePickerDefault(field.value)}
                  onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="to"
            render={({ field }) => (
              <div className="space-y-1 max-w-[280px]">
                <p className="text-xs text-onCard font-medium">
                  To <span className="text-destructive ml-0.5">*</span>
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  End of the scheduled range
                </p>
                <DatePicker
                  title=""
                  placeholder="Range end date and time"
                  required
                  disabled={isLoading}
                  defaultDate={toDatePickerDefault(field.value)}
                  onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                />
              </div>
            )}
          />

          <DropDownComponent
            control={control}
            name="status"
            required
            title="Status"
            label="Select status"
            options={statusOptions}
            disabled={isLoading}
          />

        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Reason / Notes
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <CustomInputField<IRescheduleFormFields>
            type="text"
            multipleLines
            label="Reason"
            name="reason"
            placeholder="Why is this being scheduled?"
            required
            disabled={isLoading}
            register={register}
            rows={3}
          />
        </div>
      </CardComponent>
    </div>
  );
};

export default RescheduleFormContent;

