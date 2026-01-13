import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import type { ICustomerFields } from "./CustomersForm";
import { DatePicker } from "@/components/DatePicker";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<ICustomerFields, any, ICustomerFields>;
  isUpdate?: boolean;
}

const CustomersFormContent = ({ isLoading, form,  }: IField) => {
  // const isVerified = form.watch("isVerified");

  const { control, register } = form;

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> Customer Basic Information
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
            <CustomInputField<ICustomerFields>
              type="text"
              label="Name"
              name="name"
              placeholder="e.g., Acheampong Ana"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ICustomerFields>
              register={register}
              required
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Please enter a valid email address.",
                },
              }}
              disabled={isLoading}
              type="email"
              name="email"
              label="Email"
            />
            <CustomInputField<ICustomerFields>
              type="text"
              label="Phone Number"
              name="phone"
              placeholder="e.g., 0240000000"
              required
              disabled={isLoading}
              register={register}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> Business Information
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
            <CustomInputField<ICustomerFields>
              type="text"
              label="Company Name"
              name="companyName"
              placeholder="e.g., Abi's Clothing Shop"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ICustomerFields>
              type="text"
              label="Location"
              name="location"
              multipleLines
              placeholder="e.g., Abi's Clothing Shop"
              required
              disabled={isLoading}
              register={register}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <BookOpenText className="w-4 h-4" /> Record Information
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
            <Controller
              control={control}
              name="dateConverted"
              render={({ field }) => (
                <DatePicker
                  name="dateConverted"
                  disabled={isLoading}
                  title="Date Converted"
                  placeholder="e.g. 12/09/2023"
                  dateOnly
                  required
                  onChange={field.onChange}
                  // defaultDate={field.value ? field.value : null}
                />
              )}
            />
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default CustomersFormContent;
