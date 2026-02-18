import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { IOutReachTypeFields } from "./OutReacForm";
import { ColorPickerComponent } from "@/components/ColorPickerComponent";
import { CustomSwitchComponent } from "@/components/CustomSwitchComponent";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IOutReachTypeFields, any, IOutReachTypeFields>;
  isUpdate?: boolean;
}

const OutReachFormContent = ({ isLoading, form, isUpdate }: IField) => {
  const { register, control } = form;

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> Outreach Information
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
            <CustomInputField<IOutReachTypeFields>
              type="text"
              label="Name"
              name="name"
              placeholder="e.g., Feedback calls"
              required
              disabled={isLoading}
              register={register}
              rules={{
                required: "Name is required",
                min: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
                max: {
                  value: 30,
                  message: "Type Name must be at most 30 characters",
                },
              }}
            />
            <CustomInputField<IOutReachTypeFields>
              type="text"
              label="Description"
              title="Description"
              name="description"
              placeholder="e.g., This outreach type can be used for feedback calls"
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

export default OutReachFormContent;
