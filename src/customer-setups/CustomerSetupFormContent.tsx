import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import MultiSelectorComponent from "@/components/table/component/MultiSelectorComponent";
import type { DropDownOption } from "@/components/DropdownComponent";
import { DatePicker } from "@/components/DatePicker";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import { useLazyGetUsersQuery } from "@/pages/users/common/usersApi";
import { useLazyGetSetupStatusesQuery, useLazyGetSoftwaresQuery } from "@/pages/settings/common/settingsApi";
import { lookup_params } from "@/lib/api";
import type { ISetupStatus, ISoftware } from "@/pages/settings/common/settings";
import type { ICustomer, IUser } from "@/pages/customer/common/customers";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import DropDownComponent from "@/components/DropdownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import { REQUEST_FEATURE_PRIORITY_ENUM, CUSTOMER_SETUP_STATUS_ENUM } from "@/lib/enums";
import type { ICustomerSetupFields } from "./CustomerSetupForm";

interface IField {
    isLoading?: boolean;
    form: UseFormReturn<ICustomerSetupFields, any, ICustomerSetupFields>;
    isUpdate?: boolean;
}

const CustomerSetupFormContent = ({ isLoading, form, isUpdate }: IField) => {
    const [getCustomers] = useLazyGetCustomersQuery();
    const [getSoftwares] = useLazyGetSoftwaresQuery();
    const [getUsers] = useLazyGetUsersQuery();
    const [getSetupStatuses] = useLazyGetSetupStatusesQuery();

    const [softwareOptions, setSoftwareOptions] = useState<DropDownOption<string>[]>([]);
    const [userOptions, setUserOptions] = useState<DropDownOption<string>[]>([]);
    const [setupStatusOptions, setSetupStatusOptions] = useState<DropDownOption<string>[]>([]);

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

        getUsers(lookup_params)
            .unwrap()
            .then((res: { contents?: IUser[] }) => {
                if (res?.contents) {
                    setUserOptions(
                        res.contents.map((item: IUser) => ({
                            label: `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim(),
                            value: item._id ?? "",
                        }))
                    );
                }
            });
        getSetupStatuses(lookup_params)
            .unwrap()
            .then((res: { contents?: ISetupStatus[] }) => {
                if (res?.contents) {
                    setSetupStatusOptions(
                        res.contents.map((status: ISetupStatus) => ({
                            label: status.name ?? "",
                            value: status._id ?? "",
                        }))
                    );
                }
            });



    }, [getSoftwares, getUsers, getSetupStatuses]);

    const priorityOptions = useGenerateDropdownOptionsFromEnum(REQUEST_FEATURE_PRIORITY_ENUM);
    const customerSetupStatusOptionsFromEnum = useGenerateDropdownOptionsFromEnum(CUSTOMER_SETUP_STATUS_ENUM);

    const { control, register } = form;

    return (
        <div className="space-y-2">
            <CardComponent
                headerTitle={
                    <>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="flex items-center gap-2">
                                <BookOpenText className="w-4 h-4" /> Customer Setup Info
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Required Information <span className="text-red-500">*</span>
                            </p>
                        </div>
                        <Separator orientation="horizontal" />
                    </>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2 lg:col-span-3">
                        <CustomInputField<ICustomerSetupFields>
                            type="text"
                            label="Title"
                            name="title"
                            placeholder="e.g., Enterprise POS Installation"
                            required
                            disabled={isLoading}
                            register={register}
                            rules={{
                                required: "Title is required",
                            }}
                        />
                    </div>

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
                        title="Setup Priority"
                        label="Select priority"
                        options={priorityOptions}
                        required
                        disabled={isLoading}
                    />

                    <DropDownComponent
                        control={control}
                        name="setupStatus"
                        title="Setup Status"
                        label="Select status"
                        options={setupStatusOptions}
                        required
                        disabled={isLoading}
                    />
                    <DropDownComponent
                        control={control}
                        name="status"
                        title="Customer Setup Status"
                        label="Select status"
                        options={customerSetupStatusOptionsFromEnum}
                        required
                        disabled={isLoading}
                    />

                    <Controller
                        control={control}
                        name="scheduledStart"
                        rules={{ required: !isUpdate ? "Scheduled Start is required" : false }}
                        render={({ field }) => (
                            <div className="space-y-1 w-full" key={field.value ?? "start-empty"}>
                                <p className="text-xs text-onCard font-medium">
                                    Scheduled Start {!isUpdate && <span className="text-destructive ml-0.5">*</span>}
                                </p>
                                <DatePicker
                                    title=""
                                    placeholder="Select start date"
                                    dateOnly={false}
                                    required={!isUpdate}
                                    disabled={isLoading}
                                    defaultDate={field.value ? new Date(field.value) : undefined}
                                    onChange={(date) =>
                                        field.onChange(date ? date.toISOString() : "")
                                    }
                                />
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name="scheduledEnd"
                        render={({ field }) => (
                            <div className="space-y-1 w-full" key={field.value ?? "end-empty"}>
                                <p className="text-xs text-onCard font-medium">
                                    Scheduled End
                                </p>
                                <DatePicker
                                    title=""
                                    placeholder="Select end date"
                                    dateOnly={false}
                                    disabled={isLoading}
                                    defaultDate={field.value ? new Date(field.value) : undefined}
                                    onChange={(date) =>
                                        field.onChange(date ? date.toISOString() : "")
                                    }
                                />
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name="actualCompletionDate"
                        render={({ field }) => (
                            <div className="space-y-1 w-full" key={field.value ?? "actual-empty"}>
                                <p className="text-xs text-onCard font-medium">
                                    Actual Completion Date
                                </p>
                                <DatePicker
                                    title=""
                                    placeholder="Select actual completion date"
                                    dateOnly={false}
                                    disabled={isLoading}
                                    defaultDate={field.value ? new Date(field.value) : undefined}
                                    onChange={(date) =>
                                        field.onChange(date ? date.toISOString() : "")
                                    }
                                />
                            </div>
                        )}
                    />

                    <div className="md:col-span-2 lg:col-span-3">
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

                    <div className="md:col-span-2 lg:col-span-3">
                        <CustomInputField<ICustomerSetupFields>
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

                    <div className="md:col-span-2 lg:col-span-3">
                        <CustomInputField<ICustomerSetupFields>
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

export default CustomerSetupFormContent;