import type { DropDownOption } from "@/components/DropdownComponent";
import type { IRole } from "@/pages/auth/login/common/login";
import { useNavigate, useParams } from "react-router-dom";
import { useAddRoleMutation, useLazyGetARoleQuery, useUpdateRoleMutation } from "../common/rolesApi";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import { BookOpenText } from "lucide-react";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import RolesFormContent from "./RolesFormContent";
export type IRoleFields = Omit<IRole, "_id"> & {
    name: string;
    description: string;
    permissions?: DropDownOption<string>;
};

const RolesForm = () => {
    const { id } = useParams();
    const [createRole, { isLoading: isCreating }] = useAddRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
    const [getARole, { isLoading: isGetting }] = useLazyGetARoleQuery();
    const form = useForm<IRoleFields>();
    const { watch, getValues, reset } = form;
    const values = watch();

    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null);

   

    const fetchRoleData = async (id: string) => {
        if (!id) return;

        try {
            const res = await getARole(id).unwrap();
            if (res) {
                setSelectedRole(res);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const resetFormWithData = (data: IRole) => {
        if (!data) return;
        reset({
            ...data,
            name: data.name,
            description: data.description,
            permissions: data.permissions?.map((perm) => ({
                label: perm,
            })) || [],
        } as unknown as IRoleFields);

        
    };

 

    useEffect(() => {
        if (id) {
            fetchRoleData(id);
        }
    }, [id]);

    useEffect(() => {
        if (id && selectedRole) {
            resetFormWithData(selectedRole);
        }
    }, [selectedRole]);

    const handleDataSubmission = async (payload: IRole) => {
        if (!payload) return;
        try {
            const res = id
                ? await updateRole({ ...payload, _id: id }).unwrap()
                : await createRole(payload).unwrap();

            if (res) {
                showToast({
                    title: "Success",
                    message: id
                        ? "Role updated successfully."
                        : "Role created successfully.",
                    type: "success",
                });
                navigate(-1);
            }
        } catch (error) {
            if (!error) return;
        }
    };

    const submitData = () => {
        const data = getValues();



        const requiredFields = [

            { field: data.name, message: "Name is required." },
            { field: data.description, message: "Description is required." },
           { field: data.permissions, message: "Permissions are required." },


        ];

        for (const { field, message, } of requiredFields) {
            if (!field) {
                showToast({ title: "Info", message, type: "info", duration: 1000 });
                return;
            }
        }

        const payload: IRole = cleanPayload({
            name: data.name,
            description: data.description,
            permissions: data.permissions?.map((perm) => perm) || [],
        }) as IRole;

        handleDataSubmission(payload);
    };

    const summarySections: ISummarySection[] = [
        {
            title: "Basic Information",
            icon: <BookOpenText className="w-4 h-4" />,
            data: [
                { label: "Name", value: values?.name, required: true },
                {
                    label: "Description",
                    value: values?.description,
                    required: true,
                },
            ],
        },

    ];
    const isLoading = isGetting || isCreating || isUpdating;

    return (
        <MutationFormTemplate<IRoleFields>
            form={form}
            pageSummary={{
                title: id ? "Update Role" : "Create New Role",
                description: `Enter all the details of the role you want to ${id ? "update" : "create"
                    }.`,
                icon: BookOpenText,
            }}
            formContent={
                <RolesFormContent isUpdate={!!id} form={form} isLoading={isLoading} />
            }
            submitData={submitData}
            pageTitle={
                id
                    ? `Update role - ${selectedRole?.name ?? ""}`
                    : "Add Role"
            }
            loading={isLoading}
            mutationFormSummary={{
                summaryData: summarySections,
                summaryMainTitle: "Role Details Summary",
                summarySaveButtonText: id ? "Save Changes" : "Save Role",
            }}
        />
    )
}

export default RolesForm
