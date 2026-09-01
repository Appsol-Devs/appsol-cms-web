import type { DropDownOption } from "@/components/DropdownComponent";
import type { IRole } from "@/pages/auth/login/common/login";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddRoleMutation,
  useLazyGetARoleQuery,
  useUpdateRoleMutation,
} from "../common/rolesApi";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import { BookOpenText } from "lucide-react";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import RolesFormContent from "./RolesFormContent";
import { allRoutes } from "@/utils/routes";

export type IRoleFields = Omit<IRole, "id" | "permissions"> & {
  name: string;
  description: string;
  permissions: DropDownOption<string>[];
};

const RolesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [createRole, { isLoading: isCreating }] = useAddRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [getARole, { isLoading: isGetting }] = useLazyGetARoleQuery();

  const form = useForm<IRoleFields>({
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const { watch, getValues, reset } = form;
  const values = watch();

  const fetchAndResetRoleData = async (roleId: string) => {
    try {
      const data = await getARole(roleId).unwrap();

      if (data) {
        reset({
          name: data.name,
          description: data.description,
          permissions:
            data.permissions?.map((perm: any) =>
              typeof perm === "string" ? perm : perm.name,
            ) || [],
        });
      }
    } catch (err) {
      console.error("Error fetching role:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAndResetRoleData(id);
    }
  }, [id]);

  const handleDataSubmission = async (payload: IRole) => {
    try {
      const res = id
        ? await updateRole({ ...payload, id: id }).unwrap()
        : await createRole(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Role updated successfully."
            : "Role created successfully.",
          type: "success",
        });
        navigate(allRoutes.PORTAL + allRoutes.ROLES);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitData = () => {
    const data = getValues();

    const requiredFields = [
      { field: data.name, message: "Name is required." },
      { field: data.description, message: "Description is required." },
      { field: data.permissions, message: "Permissions are required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field || (Array.isArray(field) && field.length === 0)) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const payload = cleanPayload({
      name: data.name,
      description: data.description,
      permissions: data.permissions || [],
    }) as unknown as IRole;

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
        description: `Enter all the details of the role you want to ${id ? "update" : "create"}.`,
        icon: BookOpenText,
      }}
      formContent={
        <RolesFormContent isUpdate={!!id} form={form} isLoading={isLoading} />
      }
      submitData={submitData}
      pageTitle={id ? `Update role` : "Add Role"}
      loading={isLoading}
      mutationFormSummary={{
        summaryData: summarySections,
        summaryMainTitle: "Role Details Summary",
        summarySaveButtonText: id ? "Save Changes" : "Save Role",
      }}
    />
  );
};

export default RolesForm;
