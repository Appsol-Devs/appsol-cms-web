import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { Headset, Notebook, Phone } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { CheckboxComponent } from "@/components/CheckboxComponent";
import type { IComplaintFields } from "./ComplaintsForm";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import {
  useLazyGetComplaintCategoriesQuery,
  useLazyGetComplaintTypesQuery,
  useLazyGetSoftwaresQuery,
} from "@/pages/settings/common/settingsApi";
import { useEffect, useState } from "react";
import type { DropDownOption } from "@/components/DropdownComponent";
import { lookup_params, type IBaseQueryParam } from "@/lib/api";
import DropDownComponent from "@/components/DropdownComponent";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IComplaintFields, any, IComplaintFields>;
  isUpdate?: boolean;
}

const ComplaintsFormContent = ({ isLoading, form, isUpdate }: IField) => {
  const { control, register } = form;

  const [getCustomers] = useLazyGetCustomersQuery();
  const [getComplaintTypes] = useLazyGetComplaintTypesQuery();
  const [getComplaintCategories] = useLazyGetComplaintCategoriesQuery();
  const [getSoftwares] = useLazyGetSoftwaresQuery();

  const [customerOptions, setCustomerOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [complaintTypeOptions, setComplaintTypeOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [complaintCategoryOptions, setComplaintCategoryOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);

  useEffect(() => {
    getCustomers(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            })
          );
          setCustomerOptions(options);
        }
      });

    getComplaintTypes(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            })
          );
          setComplaintTypeOptions(options);
        }
      });

    getComplaintCategories(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            })
          );
          setComplaintCategoryOptions(options);
        }
      });

    getSoftwares(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            })
          );
          setSoftwareOptions(options);
        }
      });
  }, []);

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Customer Information
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
          <div className="grid grid-cols-1 gap-4">
            <DropDownComponent
              control={control}
              name="customerId"
              label="Select the customer"
              required
              title="Customer"
              options={customerOptions}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Headset className="w-4 h-4" />
                Complaint Information
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
            <DropDownComponent
              control={control}
              name="complaintTypeId"
              title="Complaint Type"
              label="Select the complaint type"
              options={complaintTypeOptions}
            />
            <DropDownComponent
              control={control}
              name="complaintCategoryId"
              title="Complaint Category"
              label="Select the complaint category"
              options={complaintCategoryOptions}
            />
            <DropDownComponent
              control={control}
              name="relatedSoftwareId"
              title="Related Software"
              label="Select the related software"
              options={softwareOptions}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Notebook className="w-4 h-4" />
                Complaint Description
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
          <div className="grid grid-cols-1 gap-4">
            <CustomInputField<IComplaintFields>
              type="text"
              multipleLines
              label="Description"
              name="description"
              disabled={isLoading}
              register={register}
            />
            {/* {isUpdate && (
              <CheckboxComponent
                control={control}
                name="isActive"
                label="Is Active?"
              />
            )} */}
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default ComplaintsFormContent;
