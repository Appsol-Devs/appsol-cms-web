import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { Headset } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { CheckboxComponent } from "@/components/CheckboxComponent";
import type { IComplaintCategoryFields } from "./ComplaintCategoriesForm";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IComplaintCategoryFields, any, IComplaintCategoryFields>;
  isUpdate?: boolean;
}

const ComplaintCategoriesFormContent = ({
  isLoading,
  form,
  isUpdate,
}: IField) => {
  const { control, register } = form;

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Headset className="w-4 h-4" />
                Information
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
            <CustomInputField<IComplaintCategoryFields>
              type="text"
              label="Name"
              name="name"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<IComplaintCategoryFields>
              type="text"
              multipleLines
              label="Description"
              name="description"
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<IComplaintCategoryFields>
              type="color"
              label="Color Code"
              name="colorCode"
              disabled={isLoading}
              register={register}
            />
            {isUpdate && (
              <CheckboxComponent
                control={control}
                name="isActive"
                label="Is Active?"
              />
            )}
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default ComplaintCategoriesFormContent;
