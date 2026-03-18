import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/DatePicker";
import { Controller, type UseFormReturn } from "react-hook-form";
import { CalendarClock, ClipboardList, Tag } from "lucide-react";
import DropDownComponent, { type DropDownOption } from "@/components/DropdownComponent";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import { PAYMENT_STATUS_ENUM } from "@/lib/enums";
import { useCallback } from "react";
import { lookup_params } from "@/lib/api";
import type { ICustomer } from "@/pages/customer/common/customers";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import type { IRescheduleFormFields } from "../common/reschedules";

interface Props {
  isLoading?: boolean;
  form: UseFormReturn<IRescheduleFormFields, object, IRescheduleFormFields>;
}

const targetEntityTypeOptions: DropDownOption<string>[] = [
  { label: "CustomerSetup", value: "CustomerSetup" },
  { label: "Generic", value: "Generic" },
  { label: "Ticket", value: "Ticket" },
  { label: "CustomerOutreach", value: "CustomerOutreach" },
  { label: "CustomerComplaint", value: "CustomerComplaint" },
  { label: "SubscriptionReminder", value: "SubscriptionReminder" },
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
                Reschedule Details
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

          <DropDownComponent
            control={control}
            name="targetEntityType"
            title="Target Entity Type"
            label="Select entity type"
            required
            options={targetEntityTypeOptions}
            disabled={isLoading}
          />

          <CustomInputField<IRescheduleFormFields>
            type="text"
            label="Target Entity ID (optional)"
            name="targetEntityId"
            placeholder="e.g. 691378a26e2678086c163a96"
            disabled={isLoading}
            register={register}
          />

          <Controller
            control={control}
            name="originalDateTime"
            render={({ field }) => (
              <div className="space-y-1 max-w-[280px]" key={field.value ?? "empty-original"}>
                <p className="text-xs text-onCard font-medium">
                  Original Date & Time{" "}
                  <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select original date and time"
                  required
                  disabled={isLoading}
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="newDateTime"
            render={({ field }) => (
              <div className="space-y-1 max-w-[280px]" key={field.value ?? "empty-new"}>
                <p className="text-xs text-onCard font-medium">
                  New Date & Time <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select new date and time"
                  required
                  disabled={isLoading}
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                />
              </div>
            )}
          />

          <DropDownComponent
            control={control}
            name="status"
            title="Status"
            label="Select status"
            options={statusOptions}
            disabled={isLoading}
          />

          <div className="space-y-1">
            <p className="text-xs text-onCard font-medium flex items-center gap-2">
              <Tag className="w-3 h-3" />
              Color
            </p>
            <CustomInputField<IRescheduleFormFields>
              type="color"
              label=""
              name="colorCode"
              disabled={isLoading}
              register={register}
              className="h-10 p-1"
            />
          </div>
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
            placeholder="Why is this being rescheduled?"
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

