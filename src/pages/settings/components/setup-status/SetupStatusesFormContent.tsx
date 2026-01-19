import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ISetupStatusFields } from "./SetupStatusesForm";
import { CustomSwitchComponent } from "@/components/CustomSwitchComponent";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<ISetupStatusFields, any, ISetupStatusFields>;
  isUpdate?: boolean;
}

const SetupStatusesFormContent = ({ isLoading, form, isUpdate }: IField) => {
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
            <CustomInputField<ISetupStatusFields>
              type="text"
              label="Name"
              name="name"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ISetupStatusFields>
              type="text"
              multipleLines
              label="Description"
              name="description"
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ISetupStatusFields>
              type="color"
              label="Color Code"
              name="colorCode"
              disabled={isLoading}
              register={register}
            />
            {isUpdate && (
              <CustomSwitchComponent
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

export default SetupStatusesFormContent;
