import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ISoftwareFields } from "./SoftwaresForm";
import { CustomSwitchComponent } from "@/components/CustomSwitchComponent";
import { ColorPickerComponent } from "@/components/ColorPickerComponent";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<ISoftwareFields, any, ISoftwareFields>;
  isUpdate?: boolean;
}

const SoftwaresFormContent = ({ isLoading, form, isUpdate }: IField) => {
  const { control, register } = form;

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" />
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
            <CustomInputField<ISoftwareFields>
              type="text"
              label="Name"
              name="name"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ISoftwareFields>
              type="text"
              multipleLines
              label="Description"
              name="description"
              disabled={isLoading}
              register={register}
            />
            <ColorPickerComponent
              control={control}
              name="colorCode"
              label="Color Code"
              disabled={isLoading}
            />
            {isUpdate && (
              <CustomSwitchComponent
                control={control}
                name="isActive"
                label="Is Active?"
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default SoftwaresFormContent;
