import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { type DropDownOption } from "@/components/DropdownComponent"; 
import { useLazyGetPermissionsQuery } from "@/pages/roles/common/rolesApi";
import { useEffect, useState } from "react";
import type { IRoleFields } from "./RolesForm";
import MultiSelectorComponent from "@/components/table/component/MultiSelectorComponent";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IRoleFields, any, IRoleFields>;
  isUpdate?: boolean;
}

const RolesFormContent = ({ isLoading, form }: IField) => {
  const [getPermissions] = useLazyGetPermissionsQuery();
  const [permissions, setPermissions] = useState<DropDownOption[]>([]);

  const fetchPermissions = async () => {
    try {
      const response = await getPermissions().unwrap();
      const options: DropDownOption[] = response.map((permission: any) => ({
        value: permission._id,
        label: permission.name,
      }));
      setPermissions(options);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const { control, register } = form;

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> Basic Role Information
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
          <div className="grid grid-cols-2 gap-4">
            <CustomInputField<IRoleFields>
              type="text"
              label="Role Name"
              name="name"
              placeholder="e.g., Ana"
              required
              disabled={isLoading}
              register={register}
              rules={{
                required: "Role is required",
                min: {
                  value: 3,
                  message: "Role must be at least 3 characters",
                },
                max: {
                  value: 30,
                  message: "Role must be at most 30 characters",
                },
              }}
            />
            
            <CustomInputField<IRoleFields>
              type="text"
              label="Description"
              title="Description"
              name="description"
              placeholder="e.g., This role can be used by manager"
              required
              disabled={isLoading}
              register={register}
              rules={{
                required: "Description is required",
                min: {
                  value: 3,
                  message: "Description must be at least 3 characters",
                },
                max: {
                  value: 100,
                  message: "Description must be at most 100 characters",
                },
              }}
            />

            <div className="col-span-2">
              <MultiSelectorComponent
                options={permissions}
                control={control}
                name="permissions"
                label="Permissions"
                title="Permissions"
                required
                disabled={isLoading}
                width="100%" 
              />
            </div>
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default RolesFormContent;