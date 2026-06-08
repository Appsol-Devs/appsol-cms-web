import type { DropDownOption } from "@/components/DropdownComponent";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import {
    cleanPayload,
    dropdownValueToDisplayLabel,
    resetMutationForm,
    useGenerateDropdownOptionsFromEnum,
} from "@/lib/helpers";
import { lookup_params } from "@/lib/api";
import { CUSTOMER_OUTREACH_STATUS } from "@/lib/enums";
import { useLazyGetOutReachTypesQuery } from "@/pages/outreach/common/OutReachApi";
import { useLazyGetCallStatusesQuery } from "@/pages/settings/common/settingsApi";
import { CheckCircle2, Megaphone, PhoneOutgoing, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import type { ICustomerOutreach } from "../common/customer-outreach";
import { useAddCustomerOutReachMutation, useLazyGetCustomerOutReachQuery, useUpdateCustomerOutReachMutation } from "../common/customerOutreachApi";
import CustomerOutreachFormContent from "./CustomerOutReachFormContent";

export type ICustomerOutreachFields = {
    customer?: DropDownOption<string>;
    outreachType?: DropDownOption<string>;
    callStatus?: DropDownOption<string>;
    purpose: string;
    notes: string;
    isRoutineCall: boolean;
    status?: DropDownOption<string>;
};

const CustomerOutreachForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [createMutation, { isLoading: isCreating }] = useAddCustomerOutReachMutation();
    const [updateMutation, { isLoading: isUpdating }] = useUpdateCustomerOutReachMutation();
    const [getSelectedData, { isLoading: isGetting }] = useLazyGetCustomerOutReachQuery();
    const [getOutreachTypes] = useLazyGetOutReachTypesQuery();
    const [getCallStatuses] = useLazyGetCallStatusesQuery();
    const [outreachTypeOptions, setOutreachTypeOptions] = useState<
        DropDownOption<string>[]
    >([]);
    const [callStatusOptions, setCallStatusOptions] = useState<
        DropDownOption<string>[]
    >([]);
    const outreachStatusOptions =
        useGenerateDropdownOptionsFromEnum(CUSTOMER_OUTREACH_STATUS);

    useEffect(() => {
        getOutreachTypes(lookup_params)
            .unwrap()
            .then((res) => {
                if (res?.contents) {
                    setOutreachTypeOptions(
                        res.contents.map((type: { name?: string; _id?: string }) => ({
                            label: type.name ?? "",
                            value: type._id ?? "",
                        })),
                    );
                }
            })
            .catch(() => undefined);
        getCallStatuses(lookup_params)
            .unwrap()
            .then((res) => {
                if (res?.contents) {
                    setCallStatusOptions(
                        res.contents.map((status: { name?: string; _id?: string }) => ({
                            label: status.name ?? "",
                            value: status._id ?? "",
                        })),
                    );
                }
            })
            .catch(() => undefined);
    }, [getOutreachTypes, getCallStatuses]);

    const form = useForm<ICustomerOutreachFields>({
        defaultValues: {
            isRoutineCall: false,
        }
    });

    const { watch, getValues, reset } = form;
    const values = watch();
    const [selectedData, setSelectedData] = useState<ICustomerOutreach | null>(null);

    const fetchData = async (id: string) => {
        if (!id) return;
        try {
            const res = await getSelectedData(id).unwrap();
            if (res) {
                setSelectedData(res);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const getEmptyOutreachValues = (): ICustomerOutreachFields => ({
        purpose: "",
        notes: "",
        isRoutineCall: false,
        customer: undefined,
        outreachType: undefined,
        callStatus: undefined,
        status: undefined,
    });

    const resetFormWithData = (data: ICustomerOutreach) => {
        reset({
            purpose: data.purpose ?? "",
            notes: data.notes ?? "",
            isRoutineCall: data.isRoutineCall ?? false,
            customer: data.customer
                ? { label: data.customer.name, value: data.customerId }
                : undefined,
            outreachType: data.outreachType
                ? { label: data.outreachType.name, value: data.outreachTypeId }
                : undefined,
            callStatus: data.callStatus
                ? { label: data.callStatus.name, value: data.callStatusId }
                : undefined,
            status: data.status
                ? { label: data.status, value: data.status }
                : undefined,
        });
    };

    const handleResetForm = () => {
        if (id && selectedData) {
            resetFormWithData(selectedData);
            return;
        }
        resetMutationForm(form, getEmptyOutreachValues());
    };

    useEffect(() => {
        if (id && selectedData) {
            resetFormWithData(selectedData);
        }
    }, [selectedData, id, reset]);

    // 3. Handle Submission
    const handleDataSubmission = async (payload: Partial<ICustomerOutreach>) => {
        if (!payload) return;
        try {
            const res = id
                ? await updateMutation({ _id: id, ...payload } as ICustomerOutreach).unwrap()
                : await createMutation(payload as ICustomerOutreach).unwrap();

            if (res) {
                showToast({
                    title: "Success",
                    message: id
                        ? "Outreach log updated successfully."
                        : "Outreach log created successfully.",
                    type: "success",
                });
                navigate(-1);
            }
        } catch (error) {
            console.error(error);
            showToast({
                title: "Error",
                message: id ? "Failed to update log." : "Failed to create log.",
                type: "error",
            });
        }
    };

    const submitData = () => {
        const data = getValues();

        const requiredFields: { field: unknown; message: string }[] = [
            { field: data.customer?.value, message: "Customer is required." },
            { field: data.purpose, message: "Purpose is required." },
            { field: data.outreachType?.value, message: "Outreach Type is required." },
            { field: data.callStatus?.value, message: "Call Outcome/Status is required." },
            { field: data.status?.value, message: "Overall Status is required." },

        ];

        for (const { field, message } of requiredFields) {
            if (!field) {
                showToast({ title: "Validation", message, type: "info", duration: 2000 });
                return;
            }
        }


        const payload = cleanPayload({
            customerId: data.customer?.value,
            purpose: data.purpose,
            notes: data.notes,
            isRoutineCall: data.isRoutineCall,
            outreachTypeId: data.outreachType?.value,
            callStatusId: data.callStatus?.value,
            status: data.status?.value,
        });

        handleDataSubmission(payload);
    };

    // 4. Sidebar Summary Configuration
    const summarySections: ISummarySection[] = [
        {
            title: "Interaction Info",
            icon: <User className="w-4 h-4" />,
            data: [
                { label: "Customer", value: values?.customer?.label as string, required: true },
                { label: "Purpose", value: values?.purpose, required: true },
                {
                    label: "Routine",
                    value: values?.isRoutineCall ? "Yes" : "No",
                    required: false
                },
            ],
        },
        {
            title: "Classification",
            icon: <Megaphone className="w-4 h-4" />,
            data: [
                {
                    label: "Method",
                    value:
                        dropdownValueToDisplayLabel(
                            values?.outreachType,
                            outreachTypeOptions,
                        ) ?? selectedData?.outreachType?.name,
                    required: true,
                },
                {
                    label: "Outcome",
                    value:
                        dropdownValueToDisplayLabel(
                            values?.callStatus,
                            callStatusOptions,
                        ) ?? selectedData?.callStatus?.name,
                    required: true,
                },
                {
                    label: "Status",
                    value:
                        dropdownValueToDisplayLabel(
                            values?.status,
                            outreachStatusOptions,
                        ) ?? selectedData?.status,
                    required: true,
                },
            ],
        },
        {
            title: "Details",
            icon: <CheckCircle2 className="w-4 h-4" />,
            data: [
                { label: "Notes", value: values?.notes ? "Provided" : "Empty", required: false },
            ],
        },
    ];

    const isLoading = isGetting || isCreating || isUpdating;

    return (
        <div>
            <MutationFormTemplate<ICustomerOutreachFields>
                form={form}
                pageSummary={{
                    title: id ? "Update Outreach Log" : "Log New Outreach",
                    description: `Record details of your interaction with the customer${id ? " (Editing)" : ""
                        }.`,
                    icon: PhoneOutgoing,
                }}
                formContent={
                    <CustomerOutreachFormContent
                        isUpdate={!!id}
                        form={form}
                        isLoading={isLoading}
                    />
                }
                submitData={submitData}
                pageTitle={
                    id
                        ? `Update Log - ${selectedData?.customer?.name ?? "..."}`
                        : "Add Outreach Log"
                }
                loading={isLoading}
                mutationFormSummary={{
                    summaryData: summarySections,
                    summaryMainTitle: "Log Summary",
                    summarySaveButtonText: id ? "Update Log" : "Save Log",
                }}
                onResetForm={handleResetForm}
            />
        </div>
    );
};

export default CustomerOutreachForm;