import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import DropDownComponent, { type DropDownOption } from "@/components/DropdownComponent";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import { Separator } from "@/components/ui/separator";
import { lookup_params } from "@/lib/api";
import { FileText, Megaphone, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import type { ICustomerOutreachFields } from "./CustomerOutReachForm";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import { useLazyGetOutReachTypesQuery } from "@/pages/outreach/common/OutReachApi";
import { useLazyGetCallStatusesQuery } from "@/pages/settings/common/settingsApi";
import { CustomSwitchComponent } from "@/components/CustomSwitchComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import { CUSTOMER_OUTREACH_STATUS } from "@/lib/enums";


interface IField {
    isLoading?: boolean;
    form: UseFormReturn<ICustomerOutreachFields, any, ICustomerOutreachFields>;
    isUpdate?: boolean;
}

const CustomerOutreachFormContent = ({ isLoading, form }: IField) => {
    const { control, register } = form;

    const [getCustomers] = useLazyGetCustomersQuery();
    const [getOutreachTypes] = useLazyGetOutReachTypesQuery();
    const [getCallStatusOptions] = useLazyGetCallStatusesQuery();
    const OutreachStatusOptions =
        useGenerateDropdownOptionsFromEnum(CUSTOMER_OUTREACH_STATUS);

    const [typeOptions, setTypeOptions] = useState<DropDownOption<string>[]>([]);
    const [statusOptions, setStatusOptions] = useState<DropDownOption<string>[]>([]);

    const loadCustomerOptions = useCallback(
        async (inputValue: string): Promise<DropDownOption<string>[]> => {
            const res = await getCustomers({ ...lookup_params, search: inputValue || undefined }).unwrap();
            if (!res?.contents) return [];
            return res.contents.map((content: { name?: string; _id?: string }) => ({
                label: content.name ?? "",
                value: content._id ?? "",
            }));
        },
        [getCustomers]
    );

    useEffect(() => {
        getOutreachTypes(lookup_params)
            .unwrap()
            .then((res) => {
                if (res && res.contents) {
                    const options = res.contents.map((type: any) => ({
                        label: type.name,
                        value: type._id,
                    }));
                    setTypeOptions(options);
                }
            });
        getCallStatusOptions(lookup_params)
            .unwrap()
            .then((res) => {
                if (res && res.contents) {
                    const options = res.contents.map((status: any) => ({
                        label: status.name,
                        value: status._id,
                    }));
                    setStatusOptions(options);
                }
            });

    }, []);

    return (
        <div className="space-y-2">
            <CardComponent
                headerTitle={
                    <>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="flex items-center gap-2">
                                <User className="w-4 h-4" /> Customer Interaction
                            </p>
                            <p className="text-xs text-rx-secondary">
                                Required Information <span className="text-red-500">*</span>
                            </p>
                        </div>
                        <Separator orientation="horizontal" />
                    </>
                }
            >
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AsyncDropDownComponent
                            control={control}
                            name="customer"
                            placeholder="Type to search customers..."
                            label="Customer"
                            required
                            disabled={isLoading}
                            options={loadCustomerOptions}
                            width="100%"
                        />

                        <CustomInputField<ICustomerOutreachFields>
                            type="text"
                            label="Purpose"
                            name="purpose"
                            placeholder="e.g., Discuss renewal pricing"
                            required
                            disabled={isLoading}
                            register={register}
                        />

                        <CustomSwitchComponent
                            control={control}
                            name="isRoutineCall"
                            label="Is Routine Call?"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </CardComponent>

            <CardComponent
                headerTitle={
                    <>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="flex items-center gap-2">
                                <Megaphone className="w-4 h-4" /> Classification
                            </p>
                            <p className="text-xs text-rx-secondary">
                                Required Information <span className="text-red-500">*</span>
                            </p>
                        </div>
                        <Separator orientation="horizontal" />
                    </>
                }
            >
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DropDownComponent
                            control={control}
                            name="outreachType"
                            title="Outreach Type"
                            label="Method (e.g. Call, Email)"
                            options={typeOptions}
                            required
                            disabled={isLoading}
                        />

                        <DropDownComponent
                            control={control}
                            name="callStatus"
                            title="Call Outcome / Status"
                            label="Result (e.g. Answered)"
                            options={statusOptions}
                            required
                            disabled={isLoading}
                        />
                         <DropDownComponent
                            control={control}
                            name="status"
                            title="Status"
                            label="Status (e.g. Completed, Cancelled)"
                            options={OutreachStatusOptions}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </CardComponent>

            <CardComponent
                headerTitle={
                    <>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Detailed Notes
                            </p>
                            <p className="text-xs text-rx-secondary">
                                Optional
                            </p>
                        </div>
                        <Separator orientation="horizontal" />
                    </>
                }
            >
                <div>
                    <CustomInputField<ICustomerOutreachFields>
                        type="text"
                        label="Call/Meeting Notes"
                        name="notes"
                        multipleLines
                        placeholder="Record the details of the conversation here..."
                        disabled={isLoading}
                        register={register}
                    />
                </div>
            </CardComponent>
        </div>
    );
};

export default CustomerOutreachFormContent;