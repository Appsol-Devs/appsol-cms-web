import CardComponent from "@/components/CardComponent";
import { CustomSwitchComponent } from "@/components/CustomSwitchComponent";
import CustomInputField from "@/components/CustomInputField";
import { DatePicker } from "@/components/DatePicker";
import DropDownComponent from "@/components/DropdownComponent";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import { Separator } from "@/components/ui/separator";
import { addMonths } from "date-fns";
import { lookup_params } from "@/lib/api";
import { SUBSCRIPTION_STATUS_OPTIONS } from "@/lib/enums";
import { Calendar, Receipt, User } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DropDownOption } from "@/components/DropdownComponent";
import type { ICustomer } from "@/pages/customer/common/customers";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import type {
  ISoftware,
  ISubscriptionType,
} from "@/pages/settings/common/settings";
import {
  useLazyGetSoftwaresQuery,
  useLazyGetSubscriptionTypesQuery,
} from "@/pages/settings/common/settingsApi";
import type { ISubscriptionFields } from "../common/subscriptions";
import { subscriptionFieldToId } from "../common/subscriptions";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<ISubscriptionFields, any, ISubscriptionFields>;
  isUpdate?: boolean;
}

const SubscriptionsFormContent = ({ isLoading, form, isUpdate }: IField) => {
  const { control, register, watch, setValue } = form;
  const skipInitialPeriodCalc = useRef(isUpdate);

  const [getCustomers] = useLazyGetCustomersQuery();
  const [getSoftwares] = useLazyGetSoftwaresQuery();
  const [getSubscriptionTypes] = useLazyGetSubscriptionTypesQuery();

  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [subscriptionTypeOptions, setSubscriptionTypeOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [subscriptionTypesMap, setSubscriptionTypesMap] = useState<
    Map<string, ISubscriptionType>
  >(new Map());

  const statusOptions: DropDownOption<string>[] = SUBSCRIPTION_STATUS_OPTIONS;

  const loadCustomerOptions = useCallback(
    async (inputValue: string): Promise<DropDownOption<string>[]> => {
      const res = await getCustomers({ ...lookup_params, search: inputValue || undefined }).unwrap();
      if (!res?.contents) return [];
      return res.contents.map((item: ICustomer) => ({
        label: item.name ?? "",
        value: item._id ?? "",
      }));
    },
    [getCustomers]
  );

  useEffect(() => {
    getSoftwares(lookup_params)
      .unwrap()
      .then((res: { contents?: ISoftware[] }) => {
        if (res?.contents) {
          setSoftwareOptions(
            res.contents.map((item: ISoftware) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            }))
          );
        }
      });
  }, [getSoftwares]);

  useEffect(() => {
    getSubscriptionTypes(lookup_params)
      .unwrap()
      .then((res: { contents?: ISubscriptionType[] }) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item: ISubscriptionType) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            })
          );
          setSubscriptionTypeOptions(options);
          const map = new Map<string, ISubscriptionType>();
          res.contents.forEach((item) => {
            if (item._id) map.set(item._id, item);
          });
          setSubscriptionTypesMap(map);
        }
      });
  }, []);

  const subscriptionTypeId = subscriptionFieldToId(
    watch("subscriptionTypeId"),
  );
  const startDate = watch("startDate");

  useEffect(() => {
    if (!subscriptionTypeId || !startDate) return;

    if (skipInitialPeriodCalc.current) {
      skipInitialPeriodCalc.current = false;
      return;
    }

    const subscriptionType = subscriptionTypesMap.get(subscriptionTypeId);
    const durationInMonths = subscriptionType?.durationInMonths ?? 1;
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return;

    const periodEnd = addMonths(start, durationInMonths);
    if (Number.isNaN(periodEnd.getTime())) return;

    setValue("currentPeriodStart", startDate);
    setValue("currentPeriodEnd", periodEnd.toISOString());
    setValue("nextBillingDate", periodEnd.toISOString());
  }, [subscriptionTypeId, startDate, subscriptionTypesMap, setValue]);

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Subscription Information
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
          <AsyncDropDownComponent
            control={control}
            name="customerId"
            placeholder="Type to search customers..."
            label="Customer"
            required
            disabled={isLoading}
            options={loadCustomerOptions}
            width="100%"
          />
          <DropDownComponent
            control={control}
            name="softwareId"
            label="Select software"
            required
            title="Software"
            options={softwareOptions}
            disabled={isLoading}
          />
          <DropDownComponent
            control={control}
            name="subscriptionTypeId"
            label="Select subscription type"
            required
            title="Subscription Type"
            options={subscriptionTypeOptions}
          />
          <DropDownComponent
            control={control}
            name="status"
            label="Select status"
            required
            title="Status"
            options={statusOptions}
          />
        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Billing Period
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
            name="startDate"
            render={({ field }) => (
              <div className="space-y-1 max-w-[200px]">
                <p className="text-xs text-onCard font-medium">
                  Start Date <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select start date"
                  dateOnly
                  required
                  disabled={isLoading}
                  defaultDate={
                    field.value && !Number.isNaN(new Date(field.value).getTime())
                      ? new Date(field.value)
                      : undefined
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
            name="currentPeriodStart"
            render={({ field }) => (
              <div className="space-y-1 max-w-[200px]">
                <p className="text-xs text-onCard font-medium">
                  Current Period Start{" "}
                  <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select date"
                  dateOnly
                  required
                  disabled={isLoading}
                  defaultDate={
                    field.value && !Number.isNaN(new Date(field.value).getTime())
                      ? new Date(field.value)
                      : undefined
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
            name="currentPeriodEnd"
            render={({ field }) => (
              <div className="space-y-1 max-w-[200px]">
                <p className="text-xs text-onCard font-medium">
                  Current Period End{" "}
                  <span className="text-destructive ml-0.5">*</span>
                  <span className="text-muted-foreground text-[10px] ml-1">
                    (auto from subscription type)
                  </span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select subscription type & start date"
                  dateOnly
                  required
                  disabled
                  defaultDate={
                    field.value && !Number.isNaN(new Date(field.value).getTime())
                      ? new Date(field.value)
                      : undefined
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
            name="nextBillingDate"
            render={({ field }) => (
              <div className="space-y-1 max-w-[200px]">
                <p className="text-xs text-onCard font-medium">
                  Next Billing Date{" "}
                  <span className="text-destructive ml-0.5">*</span>
                  <span className="text-muted-foreground text-[10px] ml-1">
                    (auto from subscription type)
                  </span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select subscription type & start date"
                  dateOnly
                  required
                  disabled
                  defaultDate={
                    field.value && !Number.isNaN(new Date(field.value).getTime())
                      ? new Date(field.value)
                      : undefined
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
                <Receipt className="w-4 h-4" />
                Amount & Settings
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField<ISubscriptionFields>
            type="number"
            label="Amount"
            name="amount"
            placeholder="0.00"
            required
            disabled={isLoading}
            register={register}
          />
          <CustomSwitchComponent
            control={control}
            name="autoRenew"
            label="Auto Renew"
            disabled={isLoading}
          />
        </div>
        <div className="mt-4">
          <CustomInputField<ISubscriptionFields>
            type="text"
            multipleLines
            label="Notes"
            name="notes"
            placeholder="Any additional notes"
            disabled={isLoading}
            register={register}
          />
        </div>
      </CardComponent>
    </div>
  );
};

export default SubscriptionsFormContent;
