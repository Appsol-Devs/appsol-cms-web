import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import MultiSelectorComponent from "@/components/table/component/MultiSelectorComponent";
import type { DropDownOption } from "@/components/DropdownComponent";
import type { IFeatureRequestFields } from "./FeatureRequestForm";
import { DatePicker } from "@/components/DatePicker";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import { useLazyGetUsersQuery } from "@/pages/users/common/usersApi";
import { useLazyGetSoftwaresQuery } from "@/pages/settings/common/settingsApi";
import { lookup_params } from "@/lib/api";
import type { ISoftware } from "@/pages/settings/common/settings";
import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import DropDownComponent from "@/components/DropdownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import {
  REQUEST_FEATURE_STATUS_ENUM,
  REQUEST_FEATURE_PRIORITY_ENUM,
} from "@/lib/enums";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IFeatureRequestFields, any, IFeatureRequestFields>;
  isUpdate?: boolean;
}

const FeatureRequestFormContent = ({ isLoading, form, isUpdate }: IField) => {
  const [getCustomers] = useLazyGetCustomersQuery();
  const [getSoftwares] = useLazyGetSoftwaresQuery();
  const [getUsers] = useLazyGetUsersQuery();

  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [userOptions, setUserOptions] = useState<DropDownOption<string>[]>([]);

  const loadCustomerOptions = useCallback(
    async (inputValue: string): Promise<DropDownOption<string>[]> => {
      const res = await getCustomers({
        ...lookup_params,
        search: inputValue || undefined,
      }).unwrap();
      if (!res?.contents) return [];
      return res.contents.map((item: ICustomer) => ({
        label: item.name ?? "",
        value: item.id ?? "",
      }));
    },
    [getCustomers],
  );

  useEffect(() => {
    getSoftwares(lookup_params)
      .unwrap()
      .then((res: { contents?: ISoftware[] }) => {
        if (res?.contents) {
          setSoftwareOptions(
            res.contents.map((item: ISoftware) => ({
              label: item.name ?? "",
              value: item.id ?? "",
            })),
          );
        }
      });

    getUsers(lookup_params)
      .unwrap()
      .then((res: { contents?: IUser[] }) => {
        if (res?.contents) {
          setUserOptions(
            res.contents.map((item: IUser) => ({
              label: `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim(),
              value: item.id ?? "",
            })),
          );
        }
      });
  }, [getSoftwares, getUsers]);

  const priorityOptions = useGenerateDropdownOptionsFromEnum(
    REQUEST_FEATURE_PRIORITY_ENUM,
  );
  const statusOptions = useGenerateDropdownOptionsFromEnum(
    REQUEST_FEATURE_STATUS_ENUM,
  );

  const { control, register } = form;

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> Feature Request Info
              </p>
              <p className="text-xs text-muted-foreground">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField<IFeatureRequestFields>
            type="text"
            label="Title"
            name="title"
            placeholder="e.g., Real time invoice update"
            required
            disabled={isLoading}
            register={register}
            rules={{
              required: "Title is required",
            }}
          />

          <AsyncDropDownComponent
            control={control}
            name="customerId"
            placeholder="Type to search customers..."
            label="Customer"
            required={!isUpdate}
            disabled={isLoading || isUpdate}
            options={loadCustomerOptions}
            width="100%"
          />

          <DropDownComponent
            control={control}
            name="softwareId"
            label="Select software"
            required={!isUpdate}
            title="Software"
            options={softwareOptions}
            disabled={isLoading || isUpdate}
          />

          <DropDownComponent
            control={control}
            name="priority"
            title="Feature Priority"
            label="Select the feature priority"
            options={priorityOptions}
            required
          />

          <DropDownComponent
            control={control}
            name="status"
            title="Feature Status"
            label="Select the feature status"
            options={statusOptions}
            required
          />

          <Controller
            control={control}
            name="requestedDate"
            rules={{
              required: !isUpdate ? "Requested Date is required" : false,
            }}
            render={({ field }) => (
              <div className="space-y-1 w-full">
                <p className="text-xs text-onCard font-medium">
                  Requested Date{" "}
                  {!isUpdate && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </p>
                <DatePicker
                  title=""
                  placeholder="Select date"
                  dateOnly
                  required={!isUpdate}
                  disabled={isLoading || isUpdate}
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : "")
                  }
                />
              </div>
            )}
          />

          <div className="md:col-span-2">
            <MultiSelectorComponent
              options={userOptions}
              control={control}
              name="assignedTo"
              label="Assigned To"
              title="Assigned To"
              disabled={isLoading}
              width="100%"
            />
          </div>

          <div className="md:col-span-1">
            <CustomInputField<IFeatureRequestFields>
              type="text"
              label="Description"
              title="Description"
              name="description"
              placeholder="Provide a detailed description..."
              disabled={isLoading}
              register={register}
              multipleLines
            />
          </div>

          <div className="md:col-span-1">
            <CustomInputField<IFeatureRequestFields>
              type="text"
              label="Notes"
              title="Notes"
              name="notes"
              placeholder="Add internal notes..."
              disabled={isLoading}
              register={register}
              multipleLines
            />
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default FeatureRequestFormContent;
