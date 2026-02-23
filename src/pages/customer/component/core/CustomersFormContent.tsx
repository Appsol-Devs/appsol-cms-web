import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { BookOpenText, MapPin, StickyNote } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import type { ICustomerFields } from "./CustomersForm";
import { DatePicker } from "@/components/DatePicker";
// import { CustomSwitchComponent } from "@/components/CustomSwitchComponent";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<ICustomerFields, any, ICustomerFields>;
  isUpdate?: boolean;
}

const CustomersFormContent = ({ isLoading, form }: IField) => {
  // const isVerified = form.watch("isVerified");

  const { control, register } = form;

  return (
    <div className="space-y-4">
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
        <div className="grid grid-cols-2 gap-4">
          <CustomInputField<ICustomerFields>
            type="text"
            label="Name"
            name="name"
            placeholder="e.g., Acheampong Ana"
            disabled={isLoading}
            register={register}
            rules={{
              required: "Name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
            }}
          />
          <CustomInputField<ICustomerFields>
            type="email"
            label="Email"
            name="email"
            placeholder="e.g., mail@example.com"
            disabled={isLoading}
            register={register}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Please enter a valid email address.",
              },
            }}
          />
          <CustomInputField<ICustomerFields>
            type="text"
            label="Phone Number"
            name="phone"
            placeholder="e.g., 0240000000"
            disabled={isLoading}
            register={register}
            rules={{
              required: "Phone number is required",
              pattern: {
                value: /^\+?[0-9]{10,15}$/,
                message: "Please enter a valid phone number.",
              },
            }}
          />
          {/* {isUpdate && (
            <CustomSwitchComponent
              control={control}
              name="status"
              label="Is Active?"
              disabled={isLoading}
            />
          )} */}
        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Business & Location
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <CustomInputField<ICustomerFields>
            type="text"
            label="Company Name"
            name="companyName"
            placeholder="e.g., Abi's Clothing Shop"
            disabled={isLoading}
            register={register}
            rules={{ required: "Company Name is required" }}
          />
          <CustomInputField<ICustomerFields>
            type="text"
            label="General Location"
            name="location"
            placeholder="e.g., Accra, Ghana"
            disabled={isLoading}
            register={register}
            rules={{ required: "Location is required" }}
          />

          {/* <div className="col-span-2 grid grid-cols-3 gap-4 border p-4 rounded-md bg-gray-50/50">
            <p className="col-span-3 text-sm font-medium">Exact Geolocation (Optional)</p>
            <CustomInputField<ICustomerFields>
              type="text"
              label="Address"
              name="geolocation.address"
              placeholder="e.g., 123 Main St"
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ICustomerFields>
              type="number"
              label="Longitude"
              name="geolocation.long"
              placeholder="e.g., -0.186964"
              disabled={isLoading}
              register={register}
              rules={{ valueAsNumber: true }}
            />
            <CustomInputField<ICustomerFields>
              type="number"
              label="Latitude"
              name="geolocation.lat"
              placeholder="e.g., 5.603717"
              disabled={isLoading}
              register={register}
              rules={{ valueAsNumber: true }}
            />
          </div> */}
        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <StickyNote className="w-4 h-4" /> Record Information
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="dateConverted"
            rules={{ required: "Date converted is required" }}
            render={({ field }) => (
              <DatePicker
                name="dateConverted"
                disabled={isLoading}
                title="Date Converted"
                placeholder="e.g. 12/09/2023"
                dateOnly
                required
                onChange={field.onChange}
              />
            )}
          />
          <CustomInputField<ICustomerFields>
            type="text"
            label="Additional Notes"
            name="notes"
            multipleLines
            placeholder="Any extra context about this customer..."
            disabled={isLoading}
            register={register}
          />
        </div>
      </CardComponent>
    </div>
  );
};

export default CustomersFormContent;
