import type { DropDownOption } from "@/components/DropdownComponent";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
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
    status: DropDownOption<string>;
};

const CustomerOutreachForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [createMutation, { isLoading: isCreating }] = useAddCustomerOutReachMutation();
    const [updateMutation, { isLoading: isUpdating }] = useUpdateCustomerOutReachMutation();
    const [getSelectedData, { isLoading: isGetting }] = useLazyGetCustomerOutReachQuery();

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

    useEffect(() => {
        if (id && selectedData) {
            reset({
                purpose: selectedData.purpose,
                notes: selectedData.notes,
                isRoutineCall: selectedData.isRoutineCall,
                customer: selectedData.customer
                    ? { label: selectedData.customer.name, value: selectedData.customerId }
                    : undefined,
                outreachType: selectedData.outreachType
                    ? { label: selectedData.outreachType.name, value: selectedData.outreachTypeId }
                    : undefined,
                callStatus: selectedData.callStatus
                    ? { label: selectedData.callStatus.name, value: selectedData.callStatusId }
                    : undefined,
                status: selectedData.status ? { label: selectedData.status, value: selectedData.status }
                    : undefined,
            });
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
                { label: "Method", value: values?.outreachType?.label as string, required: true },
                { label: "Outcome", value: values?.callStatus?.label as string, required: true },
                { label: "Status", value: values?.status?.label as string, required: true },
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
            />
        </div>
    );
};

export default CustomerOutreachForm;